// ==================== CONTADOR DE NOTIFICAÇÕES DO CANDIDATO ====================

async function carregarContadorNotificacoesCandidato() {

    // Pega o token do candidato que está logado
    const token = localStorage.getItem("token");

    // Se não estiver logado, não faz nada
    if (!token) {
        return;
    }

    // Procura o contador que está na barra lateral
    const contador = document.getElementById("contadorNotificacoes");

    // Se a página não tiver o contador, não faz nada
    if (!contador) {
        return;
    }

    try {

        // Busca as notificações do candidato
        const resposta = await fetch("http://localhost:3000/notificacoes", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const dados = await resposta.json();

        // Se deu erro no servidor
        if (!resposta.ok) {
            console.error("Erro ao buscar notificações:", dados);
            return;
        }

        // Quantidade de notificações não lidas
        const quantidade = Number(dados.naoLidas) || 0;

        // Mostra a quantidade
        if (quantidade > 0) {

            contador.textContent = quantidade;

            contador.style.display = "inline-flex";

        } else {

            contador.textContent = "0";

            contador.style.display = "none";
        }

    } catch (erro) {

        console.error("Erro ao carregar contador de notificações:", erro);

    }
}


// Executa assim que a página carregar
document.addEventListener("DOMContentLoaded", function () {

    carregarContadorNotificacoesCandidato();

});