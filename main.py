import base64
import logging
import socket
from io import BytesIO

from flask import Flask, jsonify, render_template, request
from PIL import Image

app = Flask(__name__)

logger = logging.getLogger(__name__)


@app.route("/")
def index():

    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():

    try:
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "description": "Nenhum dado recebido."})

        image_data = data.get("image")

        if not image_data:
            return jsonify({"success": False, "description": "Imagem não encontrada."})

        #
        # Remove:
        #
        # data:image/jpeg;base64,
        #

        if "," in image_data:
            image_data = image_data.split(",")[1]

        #
        # Decodifica Base64
        #

        image_bytes = base64.b64decode(image_data)

        image = Image.open(BytesIO(image_bytes))

        #
        # Apenas para debug
        #

        width, height = image.size

        print()

        print("=" * 50)

        print("Imagem recebida")

        print(f"Largura : {width}")

        print(f"Altura  : {height}")

        print()

        print(f"Modo    : {image.mode}")

        print("=" * 50)

        print()

        #
        # Aqui futuramente chamaremos
        #
        # resultado = gemini.analyze(image)
        #

        return jsonify(
            {"success": True, "description": f"Imagem recebida ({width} x {height})."}
        )

    except Exception as e:
        print(e)

        return jsonify({"success": False, "description": "Erro ao processar imagem."})


def get_local_ip():

    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

        s.connect(("8.8.8.8", 80))

        ip = s.getsockname()[0]

        s.close()

        return ip

    except Exception as error:
        logger.info(f"Erro ocorrido ao tentar resgatar o IP da máquina: {error}")
        return "127.0.0.1"


def main():

    port = 5000

    ip = get_local_ip()

    print()

    print("=" * 70)

    print("ASSISTENTE DE ORIENTAÇÃO RESIDENCIAL")

    print("=" * 70)

    print(f"PC      : http://localhost:{port}")

    print(f"CELULAR : http://{ip}:{port}")

    print("=" * 70)

    print()

    app.run(host="0.0.0.0", port=port, debug=True, ssl_context="adhoc")


if __name__ == "__main__":
    main()
