import pandas as pd

# Load the CSV (make sure it's in the same folder)
df = pd.read_csv("cs_ecommerce_enhanced.csv")

# Print all unique product IDs
print(df['product_id'].unique())
