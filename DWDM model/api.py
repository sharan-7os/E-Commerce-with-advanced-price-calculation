from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import lightgbm as lgb
import os
from sklearn.preprocessing import LabelEncoder

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ==============================
# Load and Prepare Data
# ==============================
df = pd.read_csv("cs_ecommerce_enhanced.csv")
df["order_date"] = pd.to_datetime(df["order_date"])

df["month"] = df["order_date"].dt.month
df["dayofweek"] = df["order_date"].dt.dayofweek
df["quarter"] = df["order_date"].dt.quarter
df["is_weekend"] = df["dayofweek"].isin([5, 6]).astype(int)

le_product = LabelEncoder()
df["product_enc"] = le_product.fit_transform(df["product_id"])

le_category = LabelEncoder()
df["category_enc"] = le_category.fit_transform(df["category"])

df["sales"] = df["quantity"] * df["unit_price"]

features = ["product_enc", "category_enc", "month", "dayofweek", "quarter", "is_weekend"]
target = "sales"

X = df[features]
y = df[target]

MODEL_PATH = "lgb_price_model.joblib"
ENCODER_PATH = "product_encoder.joblib"

if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
    model = joblib.load(MODEL_PATH)
    le_product = joblib.load(ENCODER_PATH)
    print("✅ Loaded model and encoder.")
else:
    train_data = lgb.Dataset(X, label=y)
    params = {
        "objective": "regression",
        "metric": "rmse",
        "boosting_type": "gbdt",
        "learning_rate": 0.05,
        "num_leaves": 31,
        "verbose": -1,
    }
    model = lgb.train(params, train_data, num_boost_round=200)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(le_product, ENCODER_PATH)

rule_recs = (
    df.groupby("product_id")
    .agg(
        rec_price=("unit_price", "mean"),
        rec_time=("order_date", "min"),
        rec_type=("category", "first"),
    )
    .reset_index()
    .set_index("product_id")
)

@app.route("/api/recommendation", methods=["GET"])
def recommendation():
    product_id = request.args.get("product_id")

    if not product_id:
        return jsonify({"error": "product_id required"}), 400

    try:
        product_id = int(product_id)
    except:
        return jsonify({"error": "product_id must be numeric"}), 400

    try:
        if product_id in df["product_id"].unique():
            prod_enc = le_product.transform([product_id])[0]
            sample = pd.DataFrame([[prod_enc, 0, 1, 1, 0, 0]], columns=features)
            pred = model.predict(sample)[0]
            return jsonify({
                "product_id": product_id,
                "method": "ml",
                "expected_sales": float(pred)
            })
    except Exception as e:
        print("⚠️ ML prediction failed:", e)

    if product_id in rule_recs.index:
        row = rule_recs.loc[product_id]
        return jsonify({
            "product_id": product_id,
            "method": "historical",
            "rec_type": row["rec_type"],
            "rec_time": str(row["rec_time"]),
            "rec_price": float(row["rec_price"])
        })

    return jsonify({"error": "no data for this product"}), 404


if __name__ == "__main__":
    print("🚀 Flask API running at: http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
