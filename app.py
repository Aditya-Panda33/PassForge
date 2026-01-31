from flask import Flask, request, jsonify, send_from_directory
import joblib

app = Flask(__name__, static_folder="static")

model = joblib.load("SVM_Model.pkl")
scaler = joblib.load("scaler.pkl")
#Hlo bro
 
def extract_features(p):
    return [[
        len(p),
        sum(c.isupper() for c in p),
        sum(c.islower() for c in p),
        sum(not c.isalnum() for c in p),
        sum(c.isdigit() for c in p)
    ]]


@app.route("/")
def home():
    return send_from_directory("static", "index.html")


@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    password = data.get("password", "")

    features = extract_features(password)
    features = scaler.transform(features)

    prob = model.predict_proba(features)[0][1]
    pred = int(prob >= 0.5)  # or your tuned threshold

    return jsonify({
        "strength": pred,
        "probability": float(prob)
    })


if __name__ == "__main__":
    app.run(debug=True)
