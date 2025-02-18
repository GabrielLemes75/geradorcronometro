const express = require("express");
const { createCanvas } = require("@napi-rs/canvas");

const GIFEncoder = require("gifencoder");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/generate-gif", async (req, res) => {
    const { time, bg, text } = req.query;

    if (!time) {
        return res.status(400).send("Erro: Parâmetro 'time' é obrigatório.");
    }

    const targetTime = new Date(time).getTime();
    const currentTime = new Date().getTime();
    let remainingTime = Math.max(0, Math.floor((targetTime - currentTime) / 1000));

    if (remainingTime <= 0) {
        return res.status(400).send("Erro: Tempo já expirou.");
    }

    // Configurar o tamanho do GIF
    const width = 300;
    const height = 100;
    const encoder = new GIFEncoder(width, height);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Configuração do GIF
    res.setHeader("Content-Type", "image/gif");
    encoder.createReadStream().pipe(res);
    encoder.start();
    encoder.setRepeat(0); // Loop infinito
    encoder.setDelay(1000); // Atualiza a cada 1 segundo
    encoder.setQuality(10);

    // Definir cores
    const bgColor = bg ? `#${bg}` : "#ffffff";
    const textColor = text ? `#${text}` : "#000000";

    // Gerar os quadros do GIF (10s de duração)
    for (let i = 0; i < 10 && remainingTime >= 0; i++) {
        // Fundo
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // Texto do cronômetro
        ctx.fillStyle = textColor;
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText(new Date(remainingTime * 1000).toISOString().substr(11, 8), width / 2, height / 2);

        encoder.addFrame(ctx);
        remainingTime--;
    }

    encoder.finish();
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
