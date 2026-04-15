import pandas as pd
from prepare_data import load_and_basic_clean

def compute_rule_recommendations(df):
    dfp = df.dropna(subset=['unit_price']).copy()
    
    mon = dfp.groupby(['product_id','month']).agg(
        avg_price=('unit_price','mean')
    ).reset_index()
    
    idx = mon.groupby('product_id')['avg_price'].idxmin()
    best_month = mon.loc[idx].rename(columns={'month':'best_month','avg_price':'best_month_avg_price'})
    
    sea = dfp.groupby(['product_id','season']).agg(avg_price=('unit_price','mean')).reset_index()
    idxs = sea.groupby('product_id')['avg_price'].idxmin()
    best_season = sea.loc[idxs].rename(columns={'season':'best_season','avg_price':'best_season_avg_price'})
    
    fest = dfp.dropna(subset=['festival']).groupby(['product_id','festival']).agg(avg_price=('unit_price','mean')).reset_index()
    if len(fest) > 0:
        idxf = fest.groupby('product_id')['avg_price'].idxmin()
        best_festival = fest.loc[idxf].rename(columns={'festival':'best_festival','avg_price':'best_festival_avg_price'})
    else:
        best_festival = pd.DataFrame(columns=['product_id','best_festival','best_festival_avg_price'])
    
    rec = best_month.merge(best_season, on='product_id', how='left').merge(best_festival, on='product_id', how='left')
    
    product_names = df[['product_id','product_name']].drop_duplicates(subset=['product_id'])
    rec = rec.merge(product_names, on='product_id', how='left')
    
    def decide(row):
        if pd.notnull(row.get('best_festival')):
            return ("festival", row['best_festival'], row['best_festival_avg_price'])
        else:
            return ("month", int(row['best_month']), row['best_month_avg_price'])
    
    rec[['rec_type','rec_time','rec_price']] = rec.apply(lambda r: pd.Series(decide(r)), axis=1)
    return rec

if __name__ == "__main__":
    df = load_and_basic_clean()
    rec_df = compute_rule_recommendations(df)
    rec_df.to_csv("recommendations_rule_based.csv", index=False)
    print("Saved rule-based recommendations.")
