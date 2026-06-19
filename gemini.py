from ai.gemini import analyze_image

texto = analyze_image(image)

return jsonify({"success": True, "description": texto})
