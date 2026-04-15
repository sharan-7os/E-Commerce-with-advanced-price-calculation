# E-commerce Best Time to Buy Recommendation

This project provides an efficient algorithm to recommend the best time to buy a product based on historical data and ML forecasting.

## Files
- `prepare_data.py`: Load and preprocess the CSV dataset.
- `rule_recommendation.py`: Compute fast rule-based recommendations using historical averages.
- `ml_forecast.py`: Train LightGBM regression model to forecast future prices and recommend the lowest month.
- `api_recommend.py`: Flask API to fetch recommendation for a given product_id.
- `faa913ab-857c-4bdf-bee9-2914a206f76a.csv`: Your dataset (place in /mnt/data/ or same folder).

## How to Run
1. Install dependencies:
```
pip install pandas numpy scikit-learn flask lightgbm joblib
```
2. Preprocess data:
```
python prepare_data.py
```
3. Generate rule-based recommendations:
```
python rule_recommendation.py
```
4. Train ML model and generate ML-based recommendations:
```
python ml_forecast.py
```
5. Start API server:
```
python api_recommend.py
```
6. Query API:
```
http://localhost:5000/api/recommendation?product_id=<product_id>
```

Rule-based method is very fast and explainable. ML-based method (LightGBM) is more efficient for large datasets and captures patterns across products and time.
