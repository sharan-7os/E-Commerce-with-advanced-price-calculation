import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import lightgbm as lgb
import joblib

# ==============================
# 1. Load Dataset
# ==============================
df = pd.read_csv("cs_ecommerce_enhanced.csv")

# ==============================
# 2. Feature Engineering
# ==============================
df["order_date"] = pd.to_datetime(df["order_date"])

# Time features
df["year"] = df["order_date"].dt.year
df["month"] = df["order_date"].dt.month
df["day"] = df["order_date"].dt.day
df["dayofweek"] = df["order_date"].dt.dayofweek
df["quarter"] = df["order_date"].dt.quarter
df["is_weekend"] = df["dayofweek"].isin([5, 6]).astype(int)

# Example: simple festival/season mapping (you can customize for your data)
def get_season(month):
    if month in [12, 1, 2]:
        return "Winter"
    elif month in [3, 4, 5]:
        return "Spring"
    elif month in [6, 7, 8]:
        return "Summer"
    else:
        return "Autumn"

df["season"] = df["month"].apply(get_season)

# ==============================
# 3. Encode Categorical Features
# ==============================
le_product = LabelEncoder()
df["product_encoded"] = le_product.fit_transform(df["product_id"])

le_category = LabelEncoder()
df["category_encoded"] = le_category.fit_transform(df["category"])

# ==============================
# 4. Target Variable
# ==============================
# We'll predict "sales amount" = quantity × unit_price
df["sales"] = df["quantity"] * df["unit_price"]

# ==============================
# 5. Feature Selection
# ==============================
features = [
    "product_encoded",
    "category_encoded",
    "month",
    "dayofweek",
    "quarter",
    "is_weekend",
]
target = "sales"

X = df[features]
y = df[target]

# ==============================
# 6. Train Model
# ==============================
train_data = lgb.Dataset(X, label=y)
params = {
    "objective": "regression",
    "metric": "rmse",
    "boosting_type": "gbdt",
    "learning_rate": 0.05,
    "num_leaves": 31,
    "max_depth": -1,
    "verbose": -1,
}

model = lgb.train(params, train_data, num_boost_round=200)

# ==============================
# 7. Save Model and Encoders
# ==============================
joblib.dump(model, "lgb_price_model.joblib")
joblib.dump(le_product, "product_encoder.joblib")
joblib.dump(le_category, "category_encoder.joblib")

print("✅ Training complete. Model and encoders saved.")
