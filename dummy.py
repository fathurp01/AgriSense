import requests
import random
import time

# URL API untuk mengirim data (ubah sesuai kebutuhan jika berbeda)
url = (
    "http://192.168.100.203:8080/update_status"  # Sesuaikan dengan alamat server Flask
)


def send_random_data():
    while True:
        # Generate nilai acak untuk suhu (20°C - 30°C) dan kelembapan (40% - 60%)
        random_suhu = round(random.uniform(20.0, 30.0), 2)
        random_kelembapan = round(random.uniform(40.0, 60.0), 2)
        payload = {"Suhu": random_suhu, "Kelembapan": random_kelembapan}

        try:
            # Kirim data ke API menggunakan metode POST
            response = requests.post(url, json=payload)
            if response.status_code == 200:
                print(f"Data terkirim: {payload}, Respons: {response.json()}")
            else:
                print(f"Error {response.status_code}: {response.text}")
        except Exception as e:
            print(f"Gagal mengirim data: {e}")

        # Tunggu 2 detik sebelum mengirim data berikutnya
        time.sleep(2)


if __name__ == "__main__":
    send_random_data()
