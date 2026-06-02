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

// CADASTRO USUÁRIO 
app.post("/cadastroUsuario", async (req, res) => {
    try {
        const { nome_completo, data_nasc, cpf, rg, email, telefone, endereco, cidade, uf } = req.body
        let { senha } = req.body

        senha = senha.trim()

        if (senha === "") return res.json({ resposta: "Preencha sua senha" })
        if (senha.length < 6) return res.json({ resposta: "Senha muito curta" })
        if (email.length < 6) return res.json({ resposta: "Email inválido" })
        if (nome_completo.length < 6) return res.json({ resposta: "Nome inválido" })

        let [existeEmail] = await conexao.query('SELECT * FROM cadastro_usuario WHERE email = ?', [email])
        if (existeEmail.length !== 0) return res.json({ resposta: "E-mail já cadastrado" })

        let [existeCpf] = await conexao.query('SELECT * FROM cadastro_usuario WHERE cpf = ?', [cpf])
        if (existeCpf.length !== 0) return res.json({ resposta: "CPF já cadastrado" })

        let [existeTelefone] = await conexao.query('SELECT * FROM cadastro_usuario WHERE telefone = ?', [telefone])
        if (existeTelefone.length !== 0) return res.json({ resposta: "Telefone já cadastrado" })

        const hash = crypto.createHash("sha256").update(senha).digest("base64")

        let [resultado] = await conexao.query(`
            INSERT INTO cadastro_usuario 
            (nome_completo, data_nasc, cpf, rg, email, telefone, endereco, cidade, uf, senha) 
            VALUES (?,?,?,?,?,?,?,?,?,?)
        `, [nome_completo, data_nasc, cpf, rg, email, telefone, endereco, cidade, uf, hash])

        const id_usuario = resultado.insertId

        await conexao.query(`INSERT INTO perfil_usuario (id_usuario) VALUES (?)`, [id_usuario])

        res.json({ resposta: "Cadastro efetuado com sucesso!" })

    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})


// LOGIN USUÁRIO 
app.post("/loginUsuario", async (req, res) => {
    try {
        const { cpf } = req.body
        let { senha } = req.body

        senha = senha.trim()

        const hash = crypto.createHash("sha256").update(senha).digest("base64")

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
            res.json({ valido: false })
        }

    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

// CADASTRO EMPRESA
app.post("/cadastroEmpresa", async (req, res) => {
    try {
        const { nome_empresa, cnpj, email, telefone, setor_atuacao, endereco, cidade, uf, descricao } = req.body
        let { senha } = req.body

        senha = senha.trim()

        if (senha.length < 6) return res.json({ resposta: "Senha inválida" })

        let [existeEmail] = await conexao.query('SELECT * FROM cadastro_empresas WHERE email = ?', [email])
        if (existeEmail.length !== 0) return res.json({ resposta: "E-mail já cadastrado" })

        let [existeCnpj] = await conexao.query('SELECT * FROM cadastro_empresas WHERE cnpj = ?', [cnpj])
        if (existeCnpj.length !== 0) return res.json({ resposta: "CNPJ já cadastrado" })

        const hash = crypto.createHash("sha256").update(senha).digest("base64")

        await conexao.query(`
            INSERT INTO cadastro_empresas 
            (nome_empresa, cnpj, email, telefone, setor_atuacao, endereco, cidade, uf, descricao, senha) 
            VALUES (?,?,?,?,?,?,?,?,?,?)
        `, [nome_empresa, cnpj, email, telefone, setor_atuacao, endereco, cidade, uf, descricao, hash])

        res.json({ resposta: "Cadastro efetuado com sucesso!" })

    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})


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

// RECUPERAR SENHA CANDIDATO (LOGIN)
app.put("/recuperarSenha", async (req, res) => {
    try {
        const { cpf, resposta, campo, novaSenha } = req.body

        if (!cpf || !resposta || !campo || !novaSenha) {
            return res.json({ erro: "Dados inválidos" })
        }

        if (novaSenha.length < 6) {
            return res.json({ erro: "Senha muito curta" })
        }

        const [usuarios] = await conexao.query(
            "SELECT * FROM cadastro_usuario WHERE cpf = ?",
            [cpf]
        )

        if (usuarios.length === 0) {
            return res.json({ erro: "Usuário não encontrado" })
        }

        const usuario = usuarios[0]

        const valorBanco = (usuario[campo] || "").toString().trim().toLowerCase()
        const valorDigitado = resposta.trim().toLowerCase()

        if (valorBanco !== valorDigitado) {
            return res.json({ erro: "Resposta incorreta" })
        }

        const hash = crypto.createHash("sha256").update(novaSenha).digest("base64")

        await conexao.query(
            "UPDATE cadastro_usuario SET senha = ? WHERE cpf = ?",
            [hash, cpf]
        )

        res.json({ ok: true })

    } catch (error) {

        res.status(500).json({ erro: "Erro no servidor" })
    }
})


// RECUPERAR SENHA EMPRESA (LOGIN)
app.put("/recuperarSenhaEmpresa", async (req, res) => {
    try {
        const { cnpj, resposta, campo, novaSenha } = req.body

        if (!cnpj || !resposta || !campo || !novaSenha) {
            return res.json({ erro: "Dados inválidos" })
        }

        if (novaSenha.length < 6) {
            return res.json({ erro: "Senha muito curta" })
        }

        const [empresas] = await conexao.query(
            "SELECT * FROM cadastro_empresas WHERE cnpj = ?",
            [cnpj]
        )

        if (empresas.length === 0) {
            return res.json({ erro: "Empresa não encontrada" })
        }

        const emp = empresas[0]

        const valorBanco = (emp[campo] || "").toString().trim().toLowerCase()
        const valorDigitado = resposta.trim().toLowerCase()

        if (valorBanco !== valorDigitado) {
            return res.json({ erro: "Resposta incorreta" })
        }

        const hash = crypto.createHash("sha256").update(novaSenha).digest("base64")

        await conexao.query(
            "UPDATE cadastro_empresas SET senha = ? WHERE cnpj = ?",
            [hash, cnpj]
        )

        res.json({ ok: true })

    } catch (error) {
        console.log(error)
        res.status(500).json({ erro: "Erro no servidor" })
    }
})



// PERGUNTA DE SEGURANÇA CANDIDATO (LOGIN)
app.post("/perguntaSeguranca", async (req, res) => {
    try {
        const { cpf } = req.body

        const [usuarios] = await conexao.query(
            "SELECT * FROM cadastro_usuario WHERE cpf = ?",
            [cpf]
        )

        if (usuarios.length === 0) {
            return res.json({ erro: "CPF não encontrado" })
        }

        const user = usuarios[0]

        const campos = [
            { nome: "cidade", pergunta: "Qual sua cidade?" },
            { nome: "telefone", pergunta: "Qual seu telefone?" },
            { nome: "endereco", pergunta: "Qual seu endereço?" }
        ].filter(c => user[c.nome] && user[c.nome].length > 3)

        const disponiveis = campos.filter(c => user[c.nome])

        const escolhido = disponiveis[Math.floor(Math.random() * disponiveis.length)]

        res.json({
            pergunta: escolhido.pergunta,
            campo: escolhido.nome
        })

    } catch {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

// PERGUNTA DE SEGURANÇA EMPRESA (LOGIN)
app.post("/perguntaSegurancaEmpresa", async (req, res) => {
    try {
        const { cnpj } = req.body

        const [empresas] = await conexao.query(
            "SELECT * FROM cadastro_empresas WHERE cnpj = ?",
            [cnpj]
        )

        if (empresas.length === 0) {
            return res.json({ erro: "CNPJ não encontrado" })
        }

        const emp = empresas[0]

        const campos = [
            { nome: "cidade", pergunta: "Qual a cidade da empresa?" },
            { nome: "telefone", pergunta: "Qual o telefone da empresa?" },
            { nome: "endereco", pergunta: "Qual o endereço da empresa?" }
        ].filter(c => emp[c.nome] && emp[c.nome].length > 3)

        const disponiveis = campos.filter(c => emp[c.nome])

        const escolhido = disponiveis[Math.floor(Math.random() * disponiveis.length)]

        res.json({
            pergunta: escolhido.pergunta,
            campo: escolhido.nome
        })

    } catch {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

///

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

///

// CRIAR VAGAS 
app.post("/vagasCriar", autenticarToken, async (req, res) => {
    try {

        if (!req.user.id_empresa) {
            return res.status(403).json({ erro: "Apenas empresas podem criar vagas" })
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

        const requisitosTexto = Array.isArray(requisitos)
            ? requisitos.join(', ')
            : (requisitos || "")

        await conexao.query(`
            INSERT INTO vagas_criar 
            (id_empresa, titulo_vaga, tipo, modalidade, area, descricao, cidade, uf, salario, idade_minima, idade_maxima, requisitos) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            req.user.id_empresa,
            titulo_vaga,
            tipo,
            modalidade,
            area || "Geral",
            descricao,
            cidade,
            uf,
            salario || "A combinar",
            idade_minima || 14,
            idade_maxima || 24,
            requisitosTexto
        ])

        res.json({ resposta: "Vaga publicada!" })

    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
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

        // apaga candidaturas primeiro
        await conexao.query(`
            DELETE FROM vagas_candidatar
            WHERE id_vaga = ?
        `, [id_vaga])

        // apaga vaga
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

        await conexao.execute(`
            
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
            WHERE id_vaga = ?

        `, [
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
            JSON.stringify(requisitos),
            id_vaga
        ])

        res.json({
            ok: true
        })

    } catch (erro) {

        console.log(erro)

        res.status(500).json({
            erro: "Erro ao editar vaga"
        })
    }
})

// MOSTRAR VAGAS
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

        // atualizar status
        await conexao.query(`
            UPDATE vagas_candidatar
            SET status = 'Entrevista marcada'
            WHERE id_candidatura = ?
        `, [id_candidatura])

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

// CANDIDATAR usuario
app.post('/candidatar', autenticarToken, async (req, res) => {
    try {
        const { id_vaga } = req.body
        const id_usuario = req.user.id_usuario

        // Verifica se já se candidatou
        const [existe] = await conexao.query(
            "SELECT * FROM vagas_candidatar WHERE id_vaga = ? AND id_usuario = ?",
            [id_vaga, id_usuario]
        )

        if (existe.length > 0) {
            return res.json({ mensagem: "Você já se candidatou a esta vaga" })
        }

        // 👇 AQUI é onde entra a correção
        await conexao.query(
            "INSERT INTO vagas_candidatar (id_vaga, id_usuario, status, `data_candidatura`) VALUES (?, ?, 'em análise', NOW())",
            [id_vaga, id_usuario]
        )

        res.json({ mensagem: "Candidatura enviada" })

    } catch (erro) {
        console.log(erro)
        res.status(500).json({ erro: "Erro ao candidatar" })
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

// ATUALIZAR STATUS DA CANDIDATURA 

app.put("/candidaturaStatus/:id", autenticarToken, async (req, res) => {
    try {
        const { status } = req.body
        const id = req.params.id

        const statusValidos = [
            "Em análise",
            "Entrevista marcada",
            "Aprovado",
            "Não selecionado"
        ]

        if (!statusValidos.includes(status)) {
            return res.status(400).json({ erro: "Status inválido" })
        }

        await conexao.query(`
            UPDATE vagas_candidatar
            SET status = ?
            WHERE id_candidatura = ?
        `, [status, id])

        res.json({ ok: true })

    } catch (erro) {
        res.status(500).json({ erro: "Erro ao atualizar status" })
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