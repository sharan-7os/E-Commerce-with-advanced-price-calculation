from flask import Flask, request
from flask_cors import CORS
import pandas as pd
import joblib
import lightgbm as lgb
import os
from sklearn.preprocessing import LabelEncoder

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://10.180.151.11:5173"]}})

# ==============================
# Load and Prepare Data
# ==============================
df = pd.read_csv("cs_ecommerce_enhanced.csv")
df["order_date"] = pd.to_datetime(df["order_date"])
df["product_id"] = df["product_id"].astype(str)

# Add features
df["month"] = df["order_date"].dt.month
df["dayofweek"] = df["order_date"].dt.dayofweek
df["quarter"] = df["order_date"].dt.quarter
df["is_weekend"] = df["dayofweek"].isin([5, 6]).astype(int)

# Encode products and categories
le_product = LabelEncoder()
df["product_enc"] = le_product.fit_transform(df["product_id"])
le_category = LabelEncoder()
df["category_enc"] = le_category.fit_transform(df["category"])

# Target
df["sales"] = df["quantity"] * df["unit_price"]
features = ["product_enc", "category_enc", "month", "dayofweek", "quarter", "is_weekend"]
target = "sales"

X = df[features]
y = df[target]

# ==============================
# Train or Load ML Model
# ==============================
MODEL_PATH = "lgb_price_model.joblib"
ENCODER_PATH = "product_encoder.joblib"

if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
    model = joblib.load(MODEL_PATH)
    le_product = joblib.load(ENCODER_PATH)
    print("✅ Loaded existing ML model and encoder.")
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
    print("✅ Trained new ML model and saved.")

# ==============================
# Best Month to Buy
# ==============================
best_time_recs = (
    df.groupby(["product_id", "month"])
    .agg(avg_price=("unit_price", "mean"))
    .reset_index()
)
best_time_recs = best_time_recs.loc[
    best_time_recs.groupby("product_id")["avg_price"].idxmin()
].set_index("product_id")

# ==============================
# API Endpoints
# ==============================

# Just best month
@app.route("/api/recommendation", methods=["GET"])
def recommendation():
    product_id = request.args.get("product_id")

    if not product_id:
        return "product_id required", 400

    product_id = str(product_id)
    if product_id in best_time_recs.index:
        month_num = int(best_time_recs.loc[product_id]["month"])
        month_name = pd.to_datetime(f"2023-{month_num}-01").strftime("%B")
        return month_name

    return "No data available", 404

# Best month + price
@app.route("/api/recommendation_with_price", methods=["GET"])
def recommendation_with_price():
    product_id = request.args.get("product_id")
    if not product_id:
        return "product_id required", 400

    product_id = str(product_id)
    if product_id in best_time_recs.index:
        row = best_time_recs.loc[product_id]
        month_num = int(row["month"])
        avg_price = float(row["avg_price"])
        month_name = pd.to_datetime(f"2023-{month_num}-01").strftime("%B")
        return f"{month_name}|{round(avg_price, 2)}"

    return "No data available", 404

# New endpoint: Just predicted price
@app.route("/api/predicted_price", methods=["GET"])
def predicted_price():
    product_id = request.args.get("product_id")
    if not product_id:
        return "product_id required", 400

    product_id = str(product_id)
    if product_id in best_time_recs.index:
        avg_price = float(best_time_recs.loc[product_id]["avg_price"])
        return str(round(avg_price, 2))  # return only price as plain text

    return "No data available", 404

# ==============================
# Run App
# ==============================
if __name__ == "__main__":
    print("🚀 Flask API running at: http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
