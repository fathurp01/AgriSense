import adafruit_dht
import board
import time
import digitalio
import requests

api_url = "http://192.168.100.203:8080/update_status"

def send_data(temperature, humidity):
    try:
        payload = {'Suhu': temperature, 'Kelembapan': humidity}
        response = requests.post(api_url, json=payload)
        
        # Handle response
        if response.status_code == 200:
            print("Data sent successfully:", response.json())
        else:
            print(f"Failed to send data. Status code: {response.status_code}, Response: {response.text}")
    except Exception as e:
        print(f"Unexpected error: {e}")

# Inisialisasi buzzer
buzzer = digitalio.DigitalInOut(board.D27)  # GPIO 27
buzzer.direction = digitalio.Direction.OUTPUT

# Cobalah beberapa kali untuk inisialisasi
for _ in range(3):
    try:
        DHT_SENSOR = adafruit_dht.DHT11(board.D17)  # GPIO 17
        break
    except RuntimeError as e:
        print(f"Error inisialisasi sensor: {e}. Coba lagi...")
        time.sleep(1)
else:
    print("Gagal menginisialisasi sensor. Periksa koneksi.")
    exit(1)

print("Program membaca data dari sensor DHT11")
print("Tekan Ctrl+C untuk berhenti")

try:
    while True:
        try:
            # Membaca data dari sensor
            temperature = DHT_SENSOR.temperature
            humidity = DHT_SENSOR.humidity
            
            if temperature is not None and humidity is not None:
                print(f"Suhu: {temperature:.1f}, Kelembapan: {humidity:.1f}")
                send_data(temperature, humidity)
                
                # Periksa kelembapan, nyalakan buzzer jika di atas 65%
                if humidity > 65:
                    print("Kelembapan tinggi! Buzzer menyala selama 5 detik.")
                    buzzer.value = True  # Nyalakan buzzer
                    time.sleep(5)  # Tunggu 5 detik
                    buzzer.value = False  # Matikan buzzer
            else:
                print("Gagal membaca data dari sensor DHT11. Coba lagi!")

        except RuntimeError as error:
            # Handle error saat membaca data
            print(f"Error membaca data: {error}")
        
        time.sleep(2)  # Tunggu 2 detik sebelum membaca ulang
except KeyboardInterrupt:
    print("\nProgram dihentikan")
finally:
    DHT_SENSOR.exit()  # Tutup koneksi sensor
    buzzer.value = False  # Pastikan buzzer mati