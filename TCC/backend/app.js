const express = require('express')
const cors = require('cors')
const porta = 3000
const app = express()

app.use(cors())
app.use(express.json())

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

const conexao = require("./db.js")
const crypto = require('crypto')

// JWT
const jwt = require('jsonwebtoken')
const api_chave = "segredo_super_secreto"

// UPLOAD 
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
})

const upload = multer({ storage })

app.use('/uploads', express.static('uploads'))

// TOKEN
function autenticarToken(req, res, next) {
    const authHeader = req.headers["authorization"]

    if (!authHeader) {
        return res.status(401).json({ erro: "Token não enviado" })
    }

    const token = authHeader.split(" ")[1]

    jwt.verify(token, api_chave, (err, user) => {
        if (err) {
            return res.status(403).json({ erro: "Token inválido" })
        }

        req.user = user
        next()
    })
}

// SERVIDOR 
app.listen(porta, () => {
    console.log(`Servidor rodando em: http://localhost:${porta}`)
})


// NOTIFICAÇÕES 

// IDENTIFICAR O DONO DA NOTIFICAÇÃO
function donoNotificacao(req) {

    // Se o token possui id_usuario, é candidato
    if (req.user && req.user.id_usuario) {

        return {
            campo: "id_usuario",
            valor: req.user.id_usuario
        };

    }

    // Se o token possui id_empresa, é empresa
    if (req.user && req.user.id_empresa) {

        return {
            campo: "id_empresa",
            valor: req.user.id_empresa
        };

    }

    // Token válido, mas sem identificação de candidato/empresa
    return null;
}


// LISTAR NOTIFICAÇÕES + CONTADOR DE NÃO LIDAS
app.get("/notificacoes", autenticarToken, async (req, res) => {

    try {

        const dono = donoNotificacao(req);

        // Verifica se o token identifica um candidato ou empresa
        if (!dono) {

            return res.status(401).json({
                erro: "Usuário não autenticado"
            });

        }

        // Busca as notificações do usuário logado
        const [notificacoes] = await conexao.query(`

            SELECT
                id_notificacao,
                id_usuario,
                id_empresa,
                id_candidatura,
                mensagem,
                tipo,
                lida,
                data_envio

            FROM notificacoes

            WHERE ${dono.campo} = ?

            ORDER BY data_envio DESC

        `, [dono.valor]);


        // Conta somente as notificações não lidas
        const [resultadoContador] = await conexao.query(`

            SELECT COUNT(*) AS naoLidas

            FROM notificacoes

            WHERE ${dono.campo} = ?

            AND lida = 0

        `, [dono.valor]);


        res.json({

            notificacoes: notificacoes,

            naoLidas: resultadoContador[0].naoLidas

        });

    } catch (erro) {

        console.error("Erro ao buscar notificações:", erro);

        res.status(500).json({

            erro: "Erro ao buscar notificações"

        });

    }

});


// MARCAR TODAS COMO LIDAS
app.put("/notificacoes/lerTodas", autenticarToken, async (req, res) => {

    try {

        const dono = donoNotificacao(req);

        if (!dono) {

            return res.status(401).json({
                erro: "Usuário não autenticado"
            });

        }

        await conexao.query(`

            UPDATE notificacoes

            SET lida = 1

            WHERE ${dono.campo} = ?

            AND lida = 0

        `, [dono.valor]);


        res.json({

            ok: true,

            mensagem: "Todas as notificações foram marcadas como lidas"

        });

    } catch (erro) {

        console.error("Erro ao marcar notificações como lidas:", erro);

        res.status(500).json({

            erro: "Erro ao marcar notificações como lidas"

        });

    }

});

// MARCAR UMA NOTIFICAÇÃO COMO LIDA
app.put("/notificacoes/:id/lida", autenticarToken, async (req, res) => {

    try {

        const dono = donoNotificacao(req);

        if (!dono) {

            return res.status(401).json({
                erro: "Usuário não autenticado"
            });

        }

        const { id } = req.params;


        const [resultado] = await conexao.query(`

            UPDATE notificacoes

            SET lida = 1

            WHERE id_notificacao = ?

            AND ${dono.campo} = ?

        `, [id, dono.valor]);


        if (resultado.affectedRows === 0) {

            return res.status(404).json({

                erro: "Notificação não encontrada"

            });

        }


        res.json({

            ok: true,

            mensagem: "Notificação marcada como lida"

        });

    } catch (erro) {

        console.error("Erro ao marcar notificação como lida:", erro);

        res.status(500).json({

            erro: "Erro ao marcar notificação como lida"

        });

    }

});

// EXCLUIR UMA NOTIFICAÇÃO
app.delete("/notificacoes/:id", autenticarToken, async (req, res) => {

    try {

        const dono = donoNotificacao(req);

        if (!dono) {

            return res.status(401).json({
                erro: "Usuário não autenticado"
            });

        }

        const { id } = req.params;


        const [resultado] = await conexao.query(`

            DELETE FROM notificacoes

            WHERE id_notificacao = ?

            AND ${dono.campo} = ?

        `, [id, dono.valor]);


        if (resultado.affectedRows === 0) {

            return res.status(404).json({

                erro: "Notificação não encontrada"

            });

        }


        res.json({

            ok: true,

            mensagem: "Notificação excluída"

        });

    } catch (erro) {

        console.error("Erro ao excluir notificação:", erro);

        res.status(500).json({

            erro: "Erro ao excluir notificação"

        });

    }

});

// EXCLUIR TODAS AS NOTIFICAÇÕES
app.delete("/notificacoes", autenticarToken, async (req, res) => {

    try {

        const dono = donoNotificacao(req);

        if (!dono) {

            return res.status(401).json({
                erro: "Usuário não autenticado"
            });

        }


        const [resultado] = await conexao.query(`

            DELETE FROM notificacoes

            WHERE ${dono.campo} = ?

        `, [dono.valor]);


        res.json({

            ok: true,

            excluidas: resultado.affectedRows

        });

    } catch (erro) {

        console.error("Erro ao excluir notificações:", erro);

        res.status(500).json({

            erro: "Erro ao excluir notificações"

        });

    }

});




////////////////////////////////////////////////////////////////////////////////////

// CADASTRO USUÁRIO 
app.post("/cadastroUsuario", async (req, res) => {
    try {
        let {
            nome_completo,
            data_nasc,
            cpf,
            rg,
            email,
            telefone,
            endereco,
            cidade,
            uf,
            PIN
        } = req.body

        let { senha } = req.body

        // NORMALIZAÇÕES
        nome_completo = (nome_completo || "").trim()
        email = (email || "").trim()
        cpf = (cpf || "").replace(/\D/g, "")
        rg = (rg || "").trim()
        senha = (senha || "").trim()

        // VALIDAÇÕES
        if (senha === "") {
            return res.json({ resposta: "Preencha sua senha" })
        }

        if (senha.length < 6) {
            return res.json({ resposta: "Senha muito curta" })
        }

        if (email.length < 6) {
            return res.json({ resposta: "Email inválido" })
        }

        if (nome_completo.length < 6) {
            return res.json({ resposta: "Nome inválido" })
        }

        // Não permite números no nome
        if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(nome_completo)) {
            return res.json({
                resposta: "O nome não pode conter números ou caracteres inválidos"
            })
        }

        // CPF deve conter somente 11 números
        if (cpf.length !== 11) {
            return res.json({
                resposta: "CPF inválido"
            })
        }

        // RG obrigatório
        if (rg === "") {
            return res.json({
                resposta: "Preencha seu RG"
            })
        }

        if (PIN === "") {
            return res.json({
                resposta: "Preencha seu PIN"
            })
        }

        // VERIFICAÇÕES NO BANCO
        let [existeEmail] = await conexao.query(
            'SELECT * FROM cadastro_usuario WHERE email = ?',
            [email]
        )

        if (existeEmail.length !== 0) {
            return res.json({
                resposta: "E-mail já cadastrado"
            })
        }

        let [existeCpf] = await conexao.query(
            'SELECT * FROM cadastro_usuario WHERE cpf = ?',
            [cpf]
        )

        if (existeCpf.length !== 0) {
            return res.json({
                resposta: "CPF já cadastrado"
            })
        }

        let [existeRg] = await conexao.query(
            'SELECT * FROM cadastro_usuario WHERE LOWER(TRIM(rg)) = LOWER(TRIM(?))',
            [rg]
        )

        if (existeRg.length !== 0) {
            return res.json({
                resposta: "RG já cadastrado"
            })
        }

        let [existeTelefone] = await conexao.query(
            'SELECT * FROM cadastro_usuario WHERE telefone = ?',
            [telefone]
        )

        if (existeTelefone.length !== 0) {
            return res.json({
                resposta: "Telefone já cadastrado"
            })
        }

        // CRIAR SENHA
        const hash = crypto
            .createHash("sha256")
            .update(senha)
            .digest("base64")

        // CADASTRAR USUÁRIO
        let [resultado] = await conexao.query(`
            INSERT INTO cadastro_usuario 
            (
                nome_completo,
                data_nasc,
                cpf,
                rg,
                email,
                telefone,
                endereco,
                cidade,
                uf,
                senha,
                PIN
            ) 
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
        `, [
            nome_completo,
            data_nasc,
            cpf,
            rg,
            email,
            telefone,
            endereco,
            cidade,
            uf,
            hash,
            PIN
        ])

        const id_usuario = resultado.insertId

        await conexao.query(
            `INSERT INTO perfil_usuario (id_usuario) VALUES (?)`,
            [id_usuario]
        )

        res.json({
            resposta: "Cadastro efetuado com sucesso!"
        })

    } catch (error) {

        console.error("Erro no cadastro do usuário:", error)

        res.status(500).json({
            erro: "Erro no servidor"
        })
    }
})

// LOGIN USUÁRIO 
app.post("/loginUsuario", async (req, res) => {
    try {
        let { cpf } = req.body
        let { senha } = req.body

        // Remove pontos, traços e qualquer caractere que não seja número
        cpf = (cpf || "").replace(/\D/g, "")

        senha = (senha || "").trim()

        if (cpf.length !== 11) {
            return res.json({
                valido: false,
                resposta: "CPF inválido"
            })
        }

        const hash = crypto
            .createHash("sha256")
            .update(senha)
            .digest("base64")

        const [resultado] = await conexao.query(
            `SELECT * FROM cadastro_usuario WHERE cpf = ? AND senha = ?`,
            [cpf, hash]
        )

        if (resultado.length > 0) {

            const token = jwt.sign(
                { id_usuario: resultado[0].id_usuario },
                api_chave,
                { expiresIn: "1h" }
            )

            res.json({
                valido: true,
                token: token,
                id_usuario: resultado[0].id_usuario
            })

        } else {
            res.json({
                valido: false
            })
        }

    } catch (error) {

        console.error("Erro no login do usuário:", error)

        res.status(500).json({
            erro: "Erro no servidor"
        })
    }
})

// RECUPERAR SENHA CANDIDATO USANDO PIN
app.put("/recuperarSenha", async (req, res) => {
    try {
        let { cpf, PIN, novaSenha } = req.body;

        // NORMALIZAR DADOS
        cpf = String(cpf || "").replace(/\D/g, "");
        PIN = String(PIN || "").trim();
        novaSenha = String(novaSenha || "").trim();

        // VALIDAR CAMPOS
        if (!cpf || !PIN || !novaSenha) {
            return res.status(400).json({
                ok: false,
                erro: "Preencha todos os campos."
            });
        }

        if (cpf.length !== 11) {
            return res.status(400).json({
                ok: false,
                erro: "CPF inválido."
            });
        }

        if (novaSenha.length < 6) {
            return res.status(400).json({
                ok: false,
                erro: "A senha deve ter pelo menos 6 caracteres."
            });
        }

        // BUSCAR USUÁRIO PELO CPF
        const [usuarios] = await conexao.query(
            "SELECT id_usuario, PIN FROM cadastro_usuario WHERE cpf = ?",
            [cpf]
        );

        if (usuarios.length === 0) {
            return res.status(400).json({
                ok: false,
                erro: "CPF ou PIN inválido."
            });
        }

        const usuario = usuarios[0];

        // VALIDAR PIN CADASTRADO
        const pinBanco = String(usuario.PIN ?? "").trim();

        if (!pinBanco || pinBanco !== PIN) {
            return res.status(400).json({
                ok: false,
                erro: "CPF ou PIN inválido."
            });
        }

        // CRIAR HASH DA NOVA SENHA
        const hash = crypto
            .createHash("sha256")
            .update(novaSenha)
            .digest("base64");

        // ATUALIZAR SENHA
        const [resultado] = await conexao.query(
            "UPDATE cadastro_usuario SET senha = ? WHERE id_usuario = ?",
            [hash, usuario.id_usuario]
        );

        if (resultado.affectedRows === 0) {
            return res.status(500).json({
                ok: false,
                erro: "Não foi possível atualizar a senha."
            });
        }

        return res.json({
            ok: true,
            mensagem: "Senha atualizada com sucesso!"
        });

    } catch (error) {
        console.error("Erro ao recuperar senha do candidato:", error);

        return res.status(500).json({
            ok: false,
            erro: "Erro no servidor ao recuperar a senha."
        });
    }
});


////////////////////////////////////////////////////////////////////////////////////

// CADASTRO EMPRESA
app.post("/cadastroEmpresa", async (req, res) => {
    try {
        let {
            nome_empresa,
            cnpj,
            email,
            telefone,
            setor_atuacao,
            endereco,
            cidade,
            uf,
            descricao,
            PIN
        } = req.body;

        let { senha } = req.body;

        nome_empresa = String(nome_empresa || "").trim();
        cnpj = String(cnpj || "").replace(/\D/g, "");
        email = String(email || "").trim();
        senha = String(senha || "").trim();
        PIN = String(PIN || "").trim();

        if (!senha || senha.length < 6) {
            return res.json({ resposta: "Senha inválida. Use pelo menos 6 caracteres." });
        }

        if (!PIN) {
            return res.json({ resposta: "Preencha seu PIN de segurança." });
        }

        const [existeEmail] = await conexao.query(
            "SELECT * FROM cadastro_empresas WHERE email = ?",
            [email]
        );

        if (existeEmail.length !== 0) {
            return res.json({ resposta: "E-mail já cadastrado" });
        }

        const [existeCnpj] = await conexao.query(
            "SELECT * FROM cadastro_empresas WHERE cnpj = ?",
            [cnpj]
        );

        if (existeCnpj.length !== 0) {
            return res.json({ resposta: "CNPJ já cadastrado" });
        }
        if (cnpj.length !== 14) {
            return res.json({ resposta: "CNPJ inválido" });
        }

        const hash = crypto
            .createHash("sha256")
            .update(senha)
            .digest("base64");

        await conexao.query(`
            INSERT INTO cadastro_empresas
            (
                nome_empresa, cnpj, email, telefone,
                setor_atuacao, endereco, cidade, uf,
                descricao, senha, PIN
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            nome_empresa,
            cnpj,
            email,
            telefone,
            setor_atuacao,
            endereco,
            cidade,
            uf,
            descricao,
            hash,
            PIN
        ]);

        res.json({ resposta: "Cadastro efetuado com sucesso!" });

    } catch (error) {
        console.error("Erro no cadastro da empresa:", error);
        res.status(500).json({ erro: "Erro no servidor" });
    }
});


// LOGIN EMPRESA
app.post("/loginEmpresa", async (req, res) => {
    try {
        const { email } = req.body
        let { senha } = req.body

        senha = senha.trim()

        const hash = crypto.createHash("sha256").update(senha).digest("base64")

        const [resultado] = await conexao.query(
            `SELECT * FROM cadastro_empresas WHERE email = ? AND senha = ?`,
            [email, hash]
        )

        if (resultado.length > 0) {

            const token = jwt.sign(
                { id_empresa: resultado[0].id_empresa },
                api_chave,
                { expiresIn: "1h" }
            )

            res.json({
                ok: true,
                token: token,
                id_empresa: resultado[0].id_empresa
            })

        } else {
            res.json({ ok: false })
        }

    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

// RECUPERAR SENHA EMPRESA USANDO PIN
app.put("/recuperarSenhaEmpresa", async (req, res) => {
    try {
        let { cnpj, PIN, novaSenha } = req.body;

        cnpj = String(cnpj || "").replace(/\D/g, "");
        PIN = String(PIN || "").trim();
        novaSenha = String(novaSenha || "").trim();

        if (!cnpj || !PIN || !novaSenha) {
            return res.status(400).json({
                ok: false,
                erro: "Preencha todos os campos."
            });
        }

        if (novaSenha.length < 6) {
            return res.status(400).json({
                ok: false,
                erro: "A senha deve ter pelo menos 6 caracteres."
            });
        }
        if (cnpj.length !== 14) {
            return res.status(400).json({
                ok: false,
                erro: "CNPJ inválido."
            });
        }

        const [empresas] = await conexao.query(
            "SELECT id_empresa, PIN FROM cadastro_empresas WHERE cnpj = ?",
            [cnpj]
        );

        if (empresas.length === 0) {
            return res.status(400).json({
                ok: false,
                erro: "CNPJ ou PIN inválido."
            });
        }

        const empresa = empresas[0];
        const pinBanco = String(empresa.PIN ?? "").trim();

        if (!pinBanco || pinBanco !== PIN) {
            return res.status(400).json({
                ok: false,
                erro: "CNPJ ou PIN inválido."
            });
        }

        const hash = crypto
            .createHash("sha256")
            .update(novaSenha)
            .digest("base64");

        const [resultado] = await conexao.query(
            "UPDATE cadastro_empresas SET senha = ? WHERE id_empresa = ?",
            [hash, empresa.id_empresa]
        );

        if (resultado.affectedRows === 0) {
            return res.status(500).json({
                ok: false,
                erro: "Não foi possível atualizar a senha."
            });
        }

        return res.json({
            ok: true,
            mensagem: "Senha atualizada com sucesso!"
        });

    } catch (error) {
        console.error("Erro ao recuperar senha da empresa:", error);

        return res.status(500).json({
            ok: false,
            erro: "Erro no servidor ao recuperar a senha."
        });
    }
});


////////////////////////////////////////////////////////////////////////////////////

// PERFIL MOSTRAR
app.get("/perfil/:id", autenticarToken, async (req, res) => {

    const id = req.user.id_usuario

    const [dados] = await conexao.query(`
        SELECT 
            c.nome_completo,
            c.email,
            c.data_nasc,
            c.telefone,
            c.cidade,
            p.*
        FROM cadastro_usuario c
        JOIN perfil_usuario p ON c.id_usuario = p.id_usuario
        WHERE c.id_usuario = ?
    `, [id])

    res.json(dados[0])
})

// EDITAR PERFIL 
app.put("/perfil/:id",
    autenticarToken,
    upload.fields([
        { name: 'foto' },
        { name: 'curriculo' }
    ]),
    async (req, res) => {

        try {

            const id = req.user.id_usuario

            const {
                nome_completo,
                data_nasc,
                telefone,
                cidade,
                sobre_voce,
                escolaridade,
                instituicao,
                curso,
                habilidades
            } = req.body

            const foto = req.files?.foto?.[0]?.filename || null
            const curriculo = req.files?.curriculo?.[0]?.filename || null

            await conexao.query(`
                UPDATE cadastro_usuario
                SET nome_completo=?, data_nasc=?, telefone=?, cidade=?
                WHERE id_usuario=?
            `, [nome_completo, data_nasc, telefone, cidade, id])

            await conexao.query(`
                UPDATE perfil_usuario
                SET 
                    sobre_voce=?,
                    escolaridade=?,
                    instituicao=?,
                    curso=?,
                    habilidades=?,
                    foto_perfil = COALESCE(?, foto_perfil),
                    arquivo_pdf = COALESCE(?, arquivo_pdf)
                WHERE id_usuario=?
            `, [
                sobre_voce,
                escolaridade,
                instituicao,
                curso,
                habilidades,
                foto,
                curriculo,
                id
            ])

            res.json({ ok: true })

        } catch (error) {
            res.status(500).json({ erro: "Erro ao atualizar perfil" })
        }
    }
)
// ALTERAR EMAIL E SENHA NO PERFIL
app.put("/seguranca/:id", autenticarToken, async (req, res) => {
    try {

        const id = req.user.id_usuario

        let { email, senhaAtual, novaSenha } = req.body

        senhaAtual = senhaAtual?.trim()
        novaSenha = novaSenha?.trim()
        email = email?.trim()

        if (!senhaAtual) {
            return res.json({ erro: "Digite sua senha atual" })
        }

        const hashAtual = crypto.createHash("sha256").update(senhaAtual).digest("base64")

        const [usuarios] = await conexao.query(
            "SELECT * FROM cadastro_usuario WHERE id_usuario = ?",
            [id]
        )

        if (usuarios.length === 0) {
            return res.json({ erro: "Usuário não encontrado" })
        }

        const usuario = usuarios[0]

        console.log("HASH BANCO:", usuario.senha)
        console.log("HASH DIGITADO:", hashAtual)

        if (usuario.senha !== hashAtual) {
            return res.json({ erro: "Senha atual incorreta" })
        }

        let campos = []
        let valores = []

        if (email && email !== "") {
            campos.push("email = ?")
            valores.push(email)
        }

        if (novaSenha && novaSenha !== "") {

            if (novaSenha.length < 6) {
                return res.json({ erro: "Nova senha muito curta" })
            }

            const novaHash = crypto.createHash("sha256").update(novaSenha).digest("base64")

            console.log("NOVA HASH:", novaHash)

            campos.push("senha = ?")
            valores.push(novaHash)
        }

        if (campos.length === 0) {
            return res.json({ erro: "Nada para atualizar" })
        }

        valores.push(id)

        const sql = `UPDATE cadastro_usuario SET ${campos.join(", ")} WHERE id_usuario = ?`

        console.log("SQL:", sql)
        console.log("VALORES:", valores)

        const [result] = await conexao.query(sql, valores)

        console.log("RESULTADO UPDATE:", result)

        res.json({ ok: true })

    } catch (error) {
        console.log(error)
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

////////////////////////////////////////////////////////////////////////////////////


// CRIAR VAGA
app.post("/vagasCriar", autenticarToken, async (req, res) => {

    try {

        if (!req.user.id_empresa) {
            return res.status(403).json({
                erro: "Apenas empresas podem publicar vagas"
            })
        }


        const {
            titulo_vaga,
            tipo,
            modalidade,
            area,
            descricao,
            cidade,
            uf,
            salario,
            idade_minima,
            idade_maxima,
            requisitos
        } = req.body



        // VERIFICA TODOS OS CAMPOS
        const campos = [
            titulo_vaga,
            tipo,
            modalidade,
            area,
            descricao,
            cidade,
            uf,
            idade_minima,
            idade_maxima,
            requisitos
        ]


        const vazio = campos.some(campo =>
            campo === undefined ||
            campo === null ||
            String(campo).trim() === ""
        )


        if (vazio) {

            return res.status(400).json({
                ok: false,
                erro: "Todos os campos são obrigatórios"
            })

        }



        // verifica idade
        if (Number(idade_minima) > Number(idade_maxima)) {

            return res.status(400).json({
                erro: "Idade mínima não pode ser maior que idade máxima"
            })

        }



        const requisitosTexto = Array.isArray(requisitos)
            ? requisitos.join(", ")
            : requisitos



        const sql = `

            INSERT INTO vagas_criar

            (
                id_empresa,
                titulo_vaga,
                tipo,
                modalidade,
                area,
                descricao,
                cidade,
                uf,
                salario,
                idade_minima,
                idade_maxima,
                requisitos
            )

            VALUES
            (?,?,?,?,?,?,?,?,?,?,?,?)

        `



        await conexao.query(sql, [

            req.user.id_empresa,
            titulo_vaga.trim(),
            tipo,
            modalidade,
            area.trim(),
            descricao.trim(),
            cidade.trim(),
            uf.trim(),
            salario || "A combinar",
            idade_minima,
            idade_maxima,
            requisitosTexto.trim()

        ])



        return res.json({

            ok: true,
            mensagem: "Vaga publicada com sucesso"

        })



    } catch (error) {

        console.log(error)

        res.status(500).json({

            erro: "Erro interno do servidor"

        })

    }

})

// DELETAR VAGA
app.delete("/deletarVaga/:id_vaga", autenticarToken, async (req, res) => {
    try {

        const { id_vaga } = req.params

        // verifica se a vaga pertence à empresa
        const [vaga] = await conexao.query(`
            SELECT * FROM vagas_criar
            WHERE id_vaga = ? AND id_empresa = ?
        `, [id_vaga, req.user.id_empresa])

        if (vaga.length === 0) {
            return res.status(404).json({
                erro: "Vaga não encontrada"
            })
        }

        // PEGA AS CANDIDATURAS DA VAGA
        const [candidaturas] = await conexao.query(`
            SELECT id_candidatura
            FROM vagas_candidatar
            WHERE id_vaga = ?
        `, [id_vaga])

        // APAGA ENTREVISTAS DA VAGA
        await conexao.query(`
            DELETE FROM entrevistas
            WHERE id_candidatura IN (
                SELECT id_candidatura
                FROM vagas_candidatar
                WHERE id_vaga = ?
            )
        `, [id_vaga])

        // APAGA NOTIFICAÇÕES DAS CANDIDATURAS
        if (candidaturas.length > 0) {

            const idsCandidaturas = candidaturas.map(
                candidatura => candidatura.id_candidatura
            )

            const placeholders = idsCandidaturas.map(() => "?").join(",")

            await conexao.query(`
                DELETE FROM notificacoes
                WHERE id_candidatura IN (${placeholders})
            `, idsCandidaturas)
        }

        // APAGA CANDIDATURAS
        await conexao.query(`
            DELETE FROM vagas_candidatar
            WHERE id_vaga = ?
        `, [id_vaga])

        // APAGA VAGA
        await conexao.query(`
            DELETE FROM vagas_criar
            WHERE id_vaga = ?
        `, [id_vaga])

        res.json({
            ok: true,
            mensagem: "Vaga deletada com sucesso"
        })

    } catch (erro) {

        console.log(erro)

        res.status(500).json({
            erro: "Erro ao deletar vaga"
        })
    }
})

// BUSCAR UMA VAGA ESPECÍFICA PARA EDITAR
app.get("/vaga/:id_vaga", autenticarToken, async (req, res) => {

    try {

        const { id_vaga } = req.params

        const [vaga] = await conexao.query(`
            SELECT *
            FROM vagas_criar
            WHERE id_vaga = ? AND id_empresa = ?
        `, [id_vaga, req.user.id_empresa])

        if (vaga.length === 0) {
            return res.status(404).json({
                erro: "Vaga não encontrada"
            })
        }

        res.json(vaga[0])

    } catch (erro) {

        console.log("ERRO AO CARREGAR VAGA:", erro)

        res.status(500).json({
            erro: "Erro ao carregar vaga"
        })
    }
})

// EDITAR VAGA
app.put('/editarVaga/:id_vaga', autenticarToken, async (req, res) => {

    const { id_vaga } = req.params

    const {
        titulo_vaga,
        tipo,
        modalidade,
        area,
        descricao,
        cidade,
        uf,
        salario,
        idade_minima,
        idade_maxima,
        requisitos
    } = req.body

    try {

        // verifica se a vaga pertence à empresa logada
        const [vaga] = await conexao.query(`
            SELECT id_vaga
            FROM vagas_criar
            WHERE id_vaga = ? AND id_empresa = ?
        `, [id_vaga, req.user.id_empresa])

        if (vaga.length === 0) {
            return res.status(404).json({
                erro: "Vaga não encontrada"
            })
        }

        // transforma requisitos em texto
        const requisitosTexto = Array.isArray(requisitos)
            ? requisitos.join(", ")
            : requisitos

        await conexao.query(`
            UPDATE vagas_criar
            SET
                titulo_vaga = ?,
                tipo = ?,
                modalidade = ?,
                area = ?,
                descricao = ?,
                cidade = ?,
                uf = ?,
                salario = ?,
                idade_minima = ?,
                idade_maxima = ?,
                requisitos = ?
            WHERE id_vaga = ? AND id_empresa = ?
        `, [
            titulo_vaga,
            tipo,
            modalidade,
            area,
            descricao,
            cidade,
            uf,
            salario || "A combinar",
            idade_minima,
            idade_maxima,
            requisitosTexto,
            id_vaga,
            req.user.id_empresa
        ])

        res.json({
            ok: true,
            mensagem: "Vaga editada com sucesso"
        })

    } catch (erro) {

        console.log("ERRO AO EDITAR VAGA:", erro)

        res.status(500).json({
            erro: "Erro ao editar vaga"
        })
    }
})

// MOSTRAR VAGAS EMPRESA
app.get("/vagasEmpresa/:id_empresa", autenticarToken, async (req, res) => {
    try {

        const { id_empresa } = req.params

        if (req.user.id_empresa != id_empresa) {
            return res.status(403).json({ erro: "Acesso negado" })
        }

        const [resultado] = await conexao.query(`
            SELECT 
                v.*, 
                COUNT(vc.id_candidatura) AS total_candidatos
            FROM vagas_criar v
            LEFT JOIN vagas_candidatar vc ON v.id_vaga = vc.id_vaga
            WHERE v.id_empresa = ?
            GROUP BY v.id_vaga
            ORDER BY v.id_vaga DESC
        `, [id_empresa])

        res.json(resultado)

    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar vagas" })
    }
})

// LISTAR TODAS AS VAGAS PARA CANDIDATOS
app.get('/vagas', async (req, res) => {
    try {
        const id_usuario = req.query.id_usuario || 0

        const [vagas] = await conexao.query(`
            SELECT 
                v.id_vaga,
                v.id_empresa,
                v.titulo_vaga,
                v.tipo,
                v.modalidade,
                v.area,
                v.descricao,
                v.cidade,
                v.uf,
                v.salario,
                v.idade_minima,
                v.idade_maxima,
                v.requisitos,
                e.nome_empresa,

                -- VERIFICA SE JÁ SE CANDIDATOU
                EXISTS (
                    SELECT 1 
                    FROM vagas_candidatar vc 
                    WHERE vc.id_vaga = v.id_vaga 
                    AND vc.id_usuario = ?
                ) AS ja_candidatado

            FROM vagas_criar v
            JOIN cadastro_empresas e ON v.id_empresa = e.id_empresa
            ORDER BY v.id_vaga DESC
        `, [id_usuario])

        res.json(vagas)

    } catch (erro) {
        console.log(erro)
        res.status(500).json({ erro: "Erro ao buscar vagas" })
    }
})

// Mostrar candidatos
app.get("/candidatosEmpresa/:id_empresa", autenticarToken, async (req, res) => {
    try {

        const { id_empresa } = req.params

        if (req.user.id_empresa != id_empresa) {
            return res.status(403).json({
                erro: "Acesso negado"
            })
        }

        const [dados] = await conexao.query(`
            SELECT 
                vc.id_candidatura,
                vc.id_usuario,
                vc.id_vaga,

                cu.nome_completo,
                cu.data_nasc,

                p.foto_perfil,

                vc.status,

                v.titulo_vaga

            FROM vagas_candidatar vc

            JOIN cadastro_usuario cu
                ON vc.id_usuario = cu.id_usuario

            LEFT JOIN perfil_usuario p
                ON cu.id_usuario = p.id_usuario

            JOIN vagas_criar v
                ON vc.id_vaga = v.id_vaga

            WHERE v.id_empresa = ?

            ORDER BY cu.nome_completo ASC
        `, [id_empresa])

        res.json(dados)

    } catch (erro) {

        console.log(erro)

        res.status(500).json({
            erro: "Erro ao buscar candidatos"
        })
    }
})

// PERFIL DO CANDIDATO EMPRESA
app.get("/perfilCandidato/:id", autenticarToken, async (req, res) => {

    try {

        const id = req.params.id

        const [dados] = await conexao.query(`
            SELECT 
                c.nome_completo,
                c.email,
                c.telefone,
                c.cidade,
                c.uf,

                p.sobre_voce,
                p.escolaridade,
                p.instituicao,
                p.curso,
                p.habilidades,
                p.foto_perfil,
                p.arquivo_pdf

            FROM cadastro_usuario c

            LEFT JOIN perfil_usuario p
                ON c.id_usuario = p.id_usuario

            WHERE c.id_usuario = ?
        `, [id])

        if (dados.length === 0) {
            return res.status(404).json({
                erro: "Usuário não encontrado"
            })
        }

        res.json(dados[0])

    } catch (erro) {

        console.log(erro)

        res.status(500).json({
            erro: "Erro ao buscar perfil"
        })
    }
})

// CRIAR ENTREVISTA 
app.post("/entrevistas", autenticarToken, async (req, res) => {

    try {

        const {
            id_candidatura,
            data,
            horario,
            tipo,
            local_link
        } = req.body

        // Buscar o candidato da candidatura
        const [candidaturas] = await conexao.query(`
            SELECT id_usuario
            FROM vagas_candidatar
            WHERE id_candidatura = ?
        `, [id_candidatura])

        if (candidaturas.length === 0) {
            return res.status(404).json({
                erro: "Candidatura não encontrada"
            })
        }

        const idUsuario = candidaturas[0].id_usuario

        // Criar entrevista
        await conexao.query(`
            INSERT INTO entrevistas
            (id_candidatura, data, horario, tipo_entrevista, local_link)
            VALUES (?, ?, ?, ?, ?)
        `, [
            id_candidatura,
            data,
            horario,
            tipo,
            local_link
        ])

        // Atualizar status
        await conexao.query(`
            UPDATE vagas_candidatar
            SET status = 'Entrevista marcada'
            WHERE id_candidatura = ?
        `, [id_candidatura])

        // Criar notificação para o candidato
        await conexao.query(`
            INSERT INTO notificacoes
            (
                id_usuario,
                id_empresa,
                id_candidatura,
                mensagem,
                tipo,
                lida,
                data_envio
            )
            VALUES
            (
                ?,
                NULL,
                ?,
                ?,
                ?,
                0,
                NOW()
            )
        `, [
            idUsuario,
            id_candidatura,
            "Sua entrevista foi marcada pela empresa.",
            "entrevista_agendada"
        ])

        res.json({
            ok: true
        })

    } catch (erro) {

        console.log(erro)

        res.status(500).json({
            erro: "Erro ao criar entrevista"
        })
    }
})

//

// CANDIDATAR USUÁRIO
app.post('/candidatar', autenticarToken, async (req, res) => {

    try {

        const { id_vaga } = req.body
        const id_usuario = req.user.id_usuario

        // Verifica se já se candidatou
        const [existe] = await conexao.query(
            `
            SELECT *
            FROM vagas_candidatar
            WHERE id_vaga = ?
            AND id_usuario = ?
            `,
            [id_vaga, id_usuario]
        )

        if (existe.length > 0) {

            return res.json({
                mensagem: "Você já se candidatou a esta vaga"
            })

        }


        // Busca a vaga e a empresa responsável por ela
        const [vaga] = await conexao.query(
            `
            SELECT
                id_vaga,
                id_empresa,
                titulo_vaga
            FROM vagas_criar
            WHERE id_vaga = ?
            `,
            [id_vaga]
        )


        if (vaga.length === 0) {

            return res.status(404).json({
                erro: "Vaga não encontrada"
            })

        }


        const id_empresa = vaga[0].id_empresa
        const titulo_vaga = vaga[0].titulo_vaga


        // Busca o nome do candidato
        const [usuario] = await conexao.query(
            `
            SELECT nome_completo
            FROM cadastro_usuario
            WHERE id_usuario = ?
            `,
            [id_usuario]
        )


        if (usuario.length === 0) {

            return res.status(404).json({
                erro: "Usuário não encontrado"
            })

        }


        const nome_usuario = usuario[0].nome_completo


        // Cria a candidatura
        const [resultado] = await conexao.query(
            `
            INSERT INTO vagas_candidatar
            (
                id_vaga,
                id_usuario,
                status,
                data_candidatura
            )
            VALUES
            (?, ?, 'em análise', NOW())
            `,
            [id_vaga, id_usuario]
        )


        // ID da candidatura criada
        const id_candidatura = resultado.insertId


        // Cria a notificação PARA A EMPRESA
        await conexao.query(
            `
            INSERT INTO notificacoes
            (
                id_usuario,
                id_empresa,
                id_candidatura,
                mensagem,
                tipo,
                lida,
                data_envio
            )
            VALUES
            (
                NULL,
                ?,
                ?,
                ?,
                ?,
                0,
                NOW()
            )
            `,
            [
                id_empresa,
                id_candidatura,
                `${nome_usuario} se candidatou à vaga "${titulo_vaga}".`,
                "nova_candidatura"
            ]
        )


        res.json({
            mensagem: "Candidatura enviada"
        })


    } catch (erro) {

        console.error("Erro ao candidatar:", erro)

        res.status(500).json({
            erro: "Erro ao candidatar"
        })

    }

})

// LISTAR CANDIDATURAS DA EMPRESA 
app.get('/candidaturasEmpresa/:idEmpresa', autenticarToken, async (req, res) => {

    const { idEmpresa } = req.params

    try {

        const [resultado] = await conexao.query(`
            SELECT 
                c.id_candidatura,
                c.id_usuario,

                u.nome_completo,
                u.data_nasc,

                p.foto_perfil,

                v.titulo_vaga

            FROM vagas_candidatar c

            JOIN cadastro_usuario u 
                ON c.id_usuario = u.id_usuario

            LEFT JOIN perfil_usuario p
                ON u.id_usuario = p.id_usuario

            JOIN vagas_criar v 
                ON c.id_vaga = v.id_vaga

            WHERE v.id_empresa = ?
        `, [idEmpresa])

        res.json(resultado)

    } catch (erro) {

        console.log(erro)

        res.status(500).json({
            erro: "Erro ao buscar candidaturas"
        })
    }
})

// LISTAR CANDIDATOS PARA ENTREVISTA
app.get("/candidatosEmpresa/:id_empresa", autenticarToken, async (req, res) => {
    try {

        const { id_empresa } = req.params

        // impede acessar candidatos de outra empresa
        if (req.user.id_empresa != id_empresa) {
            return res.status(403).json({
                erro: "Acesso negado"
            })
        }

        const [dados] = await conexao.query(`
            SELECT 
                vc.id_candidatura,
                vc.id_usuario,
                vc.id_vaga,

                cu.nome_completo,

                vc.status,

                v.titulo_vaga

            FROM vagas_candidatar vc

            JOIN cadastro_usuario cu
                ON vc.id_usuario = cu.id_usuario

            JOIN vagas_criar v
                ON vc.id_vaga = v.id_vaga

            WHERE v.id_empresa = ?

            ORDER BY cu.nome_completo ASC
        `, [id_empresa])

        res.json(dados)

    } catch (erro) {

        console.log(erro)

        res.status(500).json({
            erro: "Erro ao buscar candidatos"
        })
    }
})

// ============================================================
// ATUALIZAR STATUS DA CANDIDATURA
// ============================================================

app.put("/candidaturaStatus/:id", autenticarToken, async (req, res) => {

    try {

        const { status } = req.body
        const id = req.params.id


        // Status permitidos
        const statusValidos = [
            "Em análise",
            "Entrevista marcada",
            "Aprovado",
            "Não selecionado"
        ]


        // Verificar se o status é válido
        if (!statusValidos.includes(status)) {

            return res.status(400).json({
                erro: "Status inválido"
            })

        }


        // ========================================================
        // BUSCAR A CANDIDATURA
        // ========================================================

        const [candidaturas] = await conexao.query(`
            SELECT
                id_candidatura,
                id_usuario,
                status
            FROM vagas_candidatar
            WHERE id_candidatura = ?
        `, [id])


        // Candidatura não encontrada
        if (candidaturas.length === 0) {

            return res.status(404).json({
                erro: "Candidatura não encontrada"
            })

        }


        const candidatura = candidaturas[0]

        const idUsuario = candidatura.id_usuario
        const statusAnterior = candidatura.status


        // ========================================================
        // ATUALIZAR STATUS
        // ========================================================

        await conexao.query(`
            UPDATE vagas_candidatar
            SET status = ?
            WHERE id_candidatura = ?
        `, [status, id])


        // ========================================================
        // SE O STATUS NÃO MUDOU, NÃO CRIA OUTRA NOTIFICAÇÃO
        // ========================================================

        if (statusAnterior === status) {

            return res.json({
                ok: true,
                mensagem: "Status já estava definido dessa forma"
            })

        }


        // ========================================================
        // DEFINIR TIPO E MENSAGEM DA NOTIFICAÇÃO
        // ========================================================

        let tipo = "status_candidatura"
        let mensagem = ""


        if (status === "Aprovado") {

            tipo = "resultado_candidatura"

            mensagem =
                "Parabéns! Sua candidatura foi aprovada."


        } else if (status === "Não selecionado") {

            tipo = "resultado_candidatura"

            mensagem =
                "Sua candidatura foi encerrada. Você não foi selecionado para esta vaga."


        } else if (status === "Entrevista marcada") {

            tipo = "entrevista_agendada"

            mensagem =
                "Sua candidatura foi atualizada e uma entrevista foi marcada."


        } else if (status === "Em análise") {

            tipo = "status_candidatura"

            mensagem =
                "Sua candidatura está em análise pela empresa."

        }


        // ========================================================
        // CRIAR NOTIFICAÇÃO PARA O CANDIDATO
        // ========================================================

        await conexao.query(`
            INSERT INTO notificacoes
            (
                id_usuario,
                id_empresa,
                id_candidatura,
                mensagem,
                tipo,
                lida,
                data_envio
            )
            VALUES
            (
                ?,
                NULL,
                ?,
                ?,
                ?,
                0,
                NOW()
            )
        `, [
            idUsuario,
            id,
            mensagem,
            tipo
        ])


        // ========================================================
        // RESPOSTA
        // ========================================================

        res.json({
            ok: true,
            mensagem: "Status atualizado e candidato notificado"
        })


    } catch (erro) {

        console.error(
            "Erro ao atualizar status da candidatura:",
            erro
        )

        res.status(500).json({
            erro: "Erro ao atualizar status"
        })

    }

})

// TOTAL DE ENTREVISTAS DA EMPRESA
app.get('/totalEntrevistas/:id_empresa', autenticarToken, async (req, res) => {

    const { id_empresa } = req.params

    try {

        const [resultado] = await conexao.execute(`
            
            SELECT COUNT(*) AS total
            
            FROM entrevistas e

            INNER JOIN vagas_candidatar vc
                ON e.id_candidatura = vc.id_candidatura

            INNER JOIN vagas_criar v
                ON vc.id_vaga = v.id_vaga

            WHERE v.id_empresa = ?

        `, [id_empresa])

        res.json({
            total: resultado[0].total
        })

    } catch (erro) {

        console.log(erro)

        res.status(500).json({
            erro: "Erro ao buscar entrevistas"
        })
    }
})

// Entrevistas do Usuario
app.get('/entrevistasUsuario/:id_usuario', autenticarToken, async (req, res) => {
    try {
        const { id_usuario } = req.params;

        const [entrevistas] = await conexao.query(
            `SELECT 
                e.id_entrevista,
                e.id_candidatura,
                DATE_FORMAT(e.data, '%d/%m/%Y') AS data,
                TIME_FORMAT(e.horario, '%H:%i') AS horario,
                e.tipo_entrevista,
                e.local_link
            FROM entrevistas e
            INNER JOIN vagas_candidatar vc
                ON e.id_candidatura = vc.id_candidatura
            WHERE vc.id_usuario = ?
            ORDER BY e.data DESC, e.horario DESC`,
            [id_usuario]
        );

        res.status(200).json(entrevistas);

    } catch (erro) {
        console.error("Erro ao buscar entrevistas:", erro);

        res.status(500).json({
            erro: "Erro ao buscar entrevistas."
        });
    }
});

// BUSCAR CANDIDATURAS DO USUÁRIO
app.get('/candidaturasUsuario/:id_usuario', autenticarToken, async (req, res) => {

    try {

        const { id_usuario } = req.params;

        const [candidaturas] = await conexao.query(

            `SELECT
                vc.id_candidatura,
                vc.id_vaga,
                vc.status,

                DATE_FORMAT(
                    vc.data_candidatura,
                    '%d/%m/%Y às %H:%i'
                ) AS data_candidatura,

                v.titulo_vaga,
                v.tipo,
                v.modalidade,
                v.area,
                v.cidade,
                v.uf,
                v.salario,

                e.nome_empresa

            FROM vagas_candidatar vc

            INNER JOIN vagas_criar v
                ON vc.id_vaga = v.id_vaga

            INNER JOIN cadastro_empresas e
                ON v.id_empresa = e.id_empresa

            WHERE vc.id_usuario = ?

            ORDER BY vc.data_candidatura DESC`,

            [id_usuario]
        );


        res.status(200).json(candidaturas);


    } catch (erro) {

        console.error(
            "Erro ao buscar candidaturas:",
            erro
        );

        res.status(500).json({
            erro: "Erro ao buscar candidaturas."
        });

    }

});

