from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app)  # Allow frontend access

# Update these
EMAIL_ADDRESS = 'eflorida1024@gmail.com'
EMAIL_PASSWORD = 'jsww fusr buux glai'   

@app.route('/send-email', methods=['POST'])
def send_email():
    data = request.json
    try:
        first = data.get("firstName")
        last = data.get("lastName")
        email = data.get("email")
        phone = f"{data.get('countryCode')} {data.get('phone')}"
        message = data.get("message")

        full_message = f"""
        New Contact Form Submission:

        Name: {first} {last}
        Email: {email}
        Phone: {phone}

        Message:
        {message}
        """

        msg = MIMEMultipart()
        msg['From'] = email
        msg['To'] = 'eflorida1024@gmail.com'
        msg['Subject'] = "LitterLens Contact Form Submission"

        msg.attach(MIMEText(full_message, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.sendmail(EMAIL_ADDRESS, 'eflorida10242@gmail.com', msg.as_string())
        server.quit()

        return jsonify({'message': 'Email sent successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
