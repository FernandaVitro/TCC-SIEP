-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           10.4.32-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para siep
DROP DATABASE IF EXISTS `siep`;
CREATE DATABASE IF NOT EXISTS `siep` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin */;
USE `siep`;

-- Copiando estrutura para tabela siep.cadastro_empresas
DROP TABLE IF EXISTS `cadastro_empresas`;
CREATE TABLE IF NOT EXISTS `cadastro_empresas` (
  `id_empresa` int(11) NOT NULL AUTO_INCREMENT,
  `nome_empresa` varchar(150) NOT NULL,
  `cnpj` varchar(14) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `setor_atuacao` varchar(100) DEFAULT NULL,
  `endereco` varchar(150) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `uf` varchar(2) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `senha` varchar(255) NOT NULL,
  PRIMARY KEY (`id_empresa`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.cadastro_empresas: ~1 rows (aproximadamente)
DELETE FROM `cadastro_empresas`;
INSERT INTO `cadastro_empresas` (`id_empresa`, `nome_empresa`, `cnpj`, `email`, `telefone`, `setor_atuacao`, `endereco`, `cidade`, `uf`, `descricao`, `senha`) VALUES
	(2, 'siep', '44444792451', 'fernanda.vitro@aluno.senai.br', '(18)991900877', 'Tecnologia', 'Humberto', 'presidente prudente', 'SP', NULL, 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=');

-- Copiando estrutura para tabela siep.cadastro_usuario
DROP TABLE IF EXISTS `cadastro_usuario`;
CREATE TABLE IF NOT EXISTS `cadastro_usuario` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nome_completo` varchar(150) NOT NULL,
  `data_nasc` date NOT NULL,
  `cpf` varchar(11) NOT NULL,
  `rg` varchar(20) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `endereco` varchar(150) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `uf` varchar(2) DEFAULT NULL,
  `senha` varchar(255) NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `cpf` (`cpf`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.cadastro_usuario: ~2 rows (aproximadamente)
DELETE FROM `cadastro_usuario`;
INSERT INTO `cadastro_usuario` (`id_usuario`, `nome_completo`, `data_nasc`, `cpf`, `rg`, `email`, `telefone`, `endereco`, `cidade`, `uf`, `senha`) VALUES
	(2, 'Ana Julia da Silva', '2000-07-09', '48344792854', '10101010', 'fernanda.vitro@aluno.senai.br', '(18)991900877', 'Domingos ', 'presidente prudente', 'SP', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI='),
	(3, 'Maria Vitoria de Santos', '1987-12-25', '48344792853', '10101010', 'fernandarafaela1@aluno.senai.br', '(18)9919008778', 'João Domingos', 'Bangú', 'RJ', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=');

-- Copiando estrutura para tabela siep.entrevistas
DROP TABLE IF EXISTS `entrevistas`;
CREATE TABLE IF NOT EXISTS `entrevistas` (
  `id_entrevista` int(11) NOT NULL AUTO_INCREMENT,
  `id_candidatura` int(11) NOT NULL,
  `data` date NOT NULL,
  `horario` time NOT NULL,
  `tipo_entrevista` varchar(50) DEFAULT NULL,
  `local_link` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_entrevista`),
  KEY `id_candidatura` (`id_candidatura`),
  CONSTRAINT `entrevistas_ibfk_1` FOREIGN KEY (`id_candidatura`) REFERENCES `vagas_candidatar` (`id_candidatura`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.entrevistas: ~3 rows (aproximadamente)
DELETE FROM `entrevistas`;
INSERT INTO `entrevistas` (`id_entrevista`, `id_candidatura`, `data`, `horario`, `tipo_entrevista`, `local_link`) VALUES
	(1, 5, '2026-05-06', '15:30:00', 'presencial', 'Bangú'),
	(2, 5, '2026-05-06', '15:30:00', 'presencial', 'Bangú'),
	(3, 2, '2026-05-06', '15:50:00', 'presencial', 'Bangú');

-- Copiando estrutura para tabela siep.notificacoes
DROP TABLE IF EXISTS `notificacoes`;
CREATE TABLE IF NOT EXISTS `notificacoes` (
  `id_notificacao` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) DEFAULT NULL,
  `id_empresa` int(11) DEFAULT NULL,
  `id_candidatura` int(11) DEFAULT NULL,
  `mensagem` text NOT NULL,
  `lida` tinyint(1) DEFAULT 0,
  `data_envio` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_notificacao`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_empresa` (`id_empresa`),
  KEY `id_candidatura` (`id_candidatura`),
  CONSTRAINT `notificacoes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `cadastro_usuario` (`id_usuario`),
  CONSTRAINT `notificacoes_ibfk_2` FOREIGN KEY (`id_empresa`) REFERENCES `cadastro_empresas` (`id_empresa`),
  CONSTRAINT `notificacoes_ibfk_3` FOREIGN KEY (`id_candidatura`) REFERENCES `vagas_candidatar` (`id_candidatura`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.notificacoes: ~0 rows (aproximadamente)
DELETE FROM `notificacoes`;

-- Copiando estrutura para tabela siep.perfil_usuario
DROP TABLE IF EXISTS `perfil_usuario`;
CREATE TABLE IF NOT EXISTS `perfil_usuario` (
  `id_perfil` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `sobre_voce` text DEFAULT NULL,
  `escolaridade` varchar(100) DEFAULT NULL,
  `instituicao` varchar(150) DEFAULT NULL,
  `curso` varchar(150) DEFAULT NULL,
  `habilidades` text DEFAULT NULL,
  `arquivo_pdf` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_perfil`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `perfil_usuario_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `cadastro_usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.perfil_usuario: ~2 rows (aproximadamente)
DELETE FROM `perfil_usuario`;
INSERT INTO `perfil_usuario` (`id_perfil`, `id_usuario`, `foto_perfil`, `sobre_voce`, `escolaridade`, `instituicao`, `curso`, `habilidades`, `arquivo_pdf`) VALUES
	(2, 2, '1778174710628-15e12f2ac188e47856403c0e78f2895c.jpg', 'sou loira', 'sesi', 'senai', 'dev1', '["bonita","mulher"]', '1777385292957-Documentando meu Navigator.pdf'),
	(3, 3, '1780416407432-IMG_20250812_105202.jpg', 'Adicione uma descrição sobre você', '', '', 'ADM', '["comunicação"]', '1780416420918-ApresentaÃ§Ã£o do tcc.pdf');

-- Copiando estrutura para tabela siep.vagas_candidatar
DROP TABLE IF EXISTS `vagas_candidatar`;
CREATE TABLE IF NOT EXISTS `vagas_candidatar` (
  `id_candidatura` int(11) NOT NULL AUTO_INCREMENT,
  `id_vaga` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `status` enum('analise','aprovado','reprovado') DEFAULT 'analise',
  `data_candidatura` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_candidatura`),
  KEY `id_vaga` (`id_vaga`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `vagas_candidatar_ibfk_1` FOREIGN KEY (`id_vaga`) REFERENCES `vagas_criar` (`id_vaga`),
  CONSTRAINT `vagas_candidatar_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `cadastro_usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.vagas_candidatar: ~4 rows (aproximadamente)
DELETE FROM `vagas_candidatar`;
INSERT INTO `vagas_candidatar` (`id_candidatura`, `id_vaga`, `id_usuario`, `status`, `data_candidatura`) VALUES
	(1, 2, 2, '', '2026-04-30 15:18:41'),
	(2, 1, 2, '', '2026-04-30 15:34:18'),
	(4, 4, 2, '', '2026-05-07 14:25:18'),
	(5, 4, 3, '', '2026-05-07 14:29:11');

-- Copiando estrutura para tabela siep.vagas_criar
DROP TABLE IF EXISTS `vagas_criar`;
CREATE TABLE IF NOT EXISTS `vagas_criar` (
  `id_vaga` int(11) NOT NULL AUTO_INCREMENT,
  `id_empresa` int(11) NOT NULL,
  `titulo_vaga` varchar(150) NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `modalidade` varchar(50) DEFAULT NULL,
  `area` varchar(100) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `uf` varchar(2) DEFAULT NULL,
  `salario` decimal(10,2) DEFAULT NULL,
  `idade_minima` int(11) DEFAULT NULL,
  `idade_maxima` int(11) DEFAULT NULL,
  `requisitos` text DEFAULT NULL,
  PRIMARY KEY (`id_vaga`),
  KEY `id_empresa` (`id_empresa`),
  CONSTRAINT `vagas_criar_ibfk_1` FOREIGN KEY (`id_empresa`) REFERENCES `cadastro_empresas` (`id_empresa`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.vagas_criar: ~3 rows (aproximadamente)
DELETE FROM `vagas_criar`;
INSERT INTO `vagas_criar` (`id_vaga`, `id_empresa`, `titulo_vaga`, `tipo`, `modalidade`, `area`, `descricao`, `cidade`, `uf`, `salario`, `idade_minima`, `idade_maxima`, `requisitos`) VALUES
	(1, 2, 'Teste 1', 'Estágio', 'Remoto', 'Tecnologia', 'Teste para ver se da certo 11:17', 'presidente prudente', 'PA', 1800.00, 14, 20, 'bonito'),
	(2, 2, 'Teste 2', 'Estágio', 'Remoto', 'Tecnologia', 'Teste para ver se da certo 11:20', 'presidente prudente', 'AP', 2000.00, 14, 20, 'bonito, inteligente'),
	(4, 2, 'teste 3', 'Jovem Aprendiz', 'Presencial', 'Indústria', 'teste de 07/05', 'presidente prudente', 'MG', 3000.00, 20, 30, '[]');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
