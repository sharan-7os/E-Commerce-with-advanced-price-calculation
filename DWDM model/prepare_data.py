import pandas as pd
import numpy as np

CSV_PATH = "cs_ecommerce_enhanced.csv"

def load_and_basic_clean(path=CSV_PATH):
    df = pd.read_csv(path, low_memory=False)
    if 'order_date' in df.columns:
        df['order_date'] = pd.to_datetime(df['order_date'], errors='coerce')
    else:
        raise ValueError("order_date column is required")
    
    # Ensure expected columns exist
    expected_cols = ['order_line_id','transaction_id','order_date','customer_id',
                     'product_id','product_name','category','unit_price','quantity','total_price']
    for c in expected_cols:
        if c not in df.columns:
            df[c] = np.nan
    
    # Derive month, year, ym
    df['year'] = df['order_date'].dt.year
    df['month'] = df['order_date'].dt.month
    df['ym'] = df['order_date'].dt.to_period('M').dt.to_timestamp()
    
    # Season mapping
    if 'season' not in df.columns:
        def month_to_season(m):
            if m in [12,1,2]: return 'Winter'
            if m in [3,4,5]: return 'Spring'
            if m in [6,7,8]: return 'Summer'
            return 'Autumn'
        df['season'] = df['month'].apply(month_to_season)
    
    if 'festival' not in df.columns:
        df['festival'] = np.nan
    
    # Numeric cleaning
    for col in ['unit_price','quantity','total_price']:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    return df

if __name__ == "__main__":
    df = load_and_basic_clean()
    print("Rows:", len(df), "Unique products:", df['product_id'].nunique())
    print(df.head())
