from flask import Flask, render_template, jsonify, request
import json

app = Flask(__name__)

status_data = {"Suhu": 0.0, "Kelembapan": 0.0}


@app.route("/")
def index():
    return render_template("index.html", status=status_data)


@app.route("/get_status", methods=["GET"])
def get_status():
    print("Sending status data", status_data)
    return jsonify(status_data)


@app.route("/update_status", methods=["POST"])
def update_status():
    try:
        data = request.json
        for key, value in data.items():
            if key in status_data:
                status_data[key] = value
            else:
                return jsonify(
                    {"success": False, "message": f"Key {key} not found"}
                ), 404
        return jsonify({"success": True, "message": "Status updated successfully"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
