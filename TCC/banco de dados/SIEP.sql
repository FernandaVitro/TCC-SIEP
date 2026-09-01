-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           10.4.32-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.20.0.7320
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.cadastro_empresas: ~7 rows (aproximadamente)
DELETE FROM `cadastro_empresas`;
INSERT INTO `cadastro_empresas` (`id_empresa`, `nome_empresa`, `cnpj`, `email`, `telefone`, `setor_atuacao`, `endereco`, `cidade`, `uf`, `descricao`, `senha`) VALUES
	(2, 'siep', '44444792451', 'fernanda.vitro@aluno.senai.br', '(18)991900877', 'Tecnologia', 'Humberto', 'presidente prudente', 'SP', NULL, 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI='),
	(3, 'ssss', '44444792452', 'fernanda.vitro@aluno.senai.br2', '(18)991900877', 'Tecnologia', 'humerto', 'pp', 'SP', NULL, 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI='),
	(4, 'lololala', '00000000000', 'laura@gmail.com', '000000000', 'Saúde', 'Rua Domingos Vieira e Silva, 95', 'Presidente Prudente', 'SP', NULL, 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI='),
	(5, 'Farmadora\'s', '51936272000139', 'farms@gmail.com', '(18) 99190-0477', 'Tecnologia', 'Rua Domingos Vieira e Silva, 95', 'Presidente Prudente', '', 'Serviços para treinar a sua farm de aura, para campeonatos internacionais', 'H8IYDezbiIp0UJDmTQDiZ7l9WfBFqme8+gJ8q12lHmA='),
	(6, 'DSDSDSA', '12121212121', 'asdasdasdas', '(13) 1232-33', 'Saúde', 'Rua Domingos Vieira e Silva, 95', 'Presidente Prudente', '', 'asdsadsadsd', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI='),
	(7, 'dfsfdfsddsfs', '24242424242424', 'adsadassadsad', '(14) 1434-3434', 'Tecnologia', 'Casa', 'Presidente Prudente', '', 'sdasdasdsaas', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI='),
	(8, 'Melpp', '12345678910111', 'melemail', '(12) 3455-7890', 'Saúde', 'Rua Domingos Vieira e Silva, 95', 'Presidente Prudente', 'SP', '.', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI='),
	(9, 'brunA', '1234567891011', 'EMAIL@senai', '(12) 3456-65', 'Tecnologia', 'Rua Domingos Vieira e Silva, 95', 'Presidente Prudente', 'CE', '', 'oyBID1NHdr3bXNtUsek9IQo8fRmegKI8GyF4SXsYTHY=');

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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.cadastro_usuario: ~14 rows (aproximadamente)
DELETE FROM `cadastro_usuario`;
INSERT INTO `cadastro_usuario` (`id_usuario`, `nome_completo`, `data_nasc`, `cpf`, `rg`, `email`, `telefone`, `endereco`, `cidade`, `uf`, `senha`) VALUES
	(2, 'Ana Julia da Silva', '2000-07-09', '48344792854', '10101010', 'fernanda.vitro@aluno.senai.br', '(18)991900877', 'Domingos ', 'presidente prudente', 'SP', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI='),
	(3, 'Maria Vitoria de Santos', '1987-12-25', '48344792853', '10101010', 'fernandarafaela1@aluno.senai.br', '(18)9919008778', 'João Domingos', 'Bangú', 'RJ', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI='),
	(4, 'Fernanda Rafaela Silva Vitro', '2008-07-09', '48344792855', '333333333333333', 'fernanda.vitro@aluno.senai.br1', '18991900477', 'humerto', 'pp', 'SP', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI='),
	(5, 'Laura Heloisa Cleveston', '2009-04-11', '00000000000', '0000000000', 'laura@gmail.com', '996648822', 'Jeronimo garcia junqueira, 61, jardim tropical', 'Presidente prudente', 'SP', 'i7DPbrmxfQ99IrRW8SElfcElTh8BZlNwR2OD6ndt9BQ='),
	(6, 'João Victor Piacenza', '2008-08-24', '35995471066', '380883089', 'joao@gmail.com', '(18) 99190-0477', 'Rua Domingos Vieira e Silva, 95', 'Presidente Prudente', 'SC', 'H8IYDezbiIp0UJDmTQDiZ7l9WfBFqme8+gJ8q12lHmA='),
	(7, 'Julia Donangelo', '3123-09-12', '12345678', '12345678', 'julia@gmail.com', '(18) 98103-0687', 'Rua Domingos Vieira e Silva, 95', 'Presidente Prudente', '', '7sbMgcmONhp9mO/Myu5pM5DHxwVk0dO1dAwQCTu4GUc='),
	(8, 'Melina', '2000-04-22', '12332145767', '664477383', 'melina@email.com', '(22) 89384-7747', 'Rua Domingos Vieira e Silva, 95', 'Presidente Prudente', 'SP', 'oyBID1NHdr3bXNtUsek9IQo8fRmegKI8GyF4SXsYTHY='),
	(9, 'Fernanda Rafaela Silva Vitr', '2333-02-11', '12345679', '12345679', '123@emsil', '(18) 99190-0478', 'Casa', 'Presidente Prudente', '', 'E3x7KgUN/3pJ7LBibsD5SKokvZ+zZfdz2SJyrv1SjIE='),
	(10, 'Melina', '2008-09-27', '48810165802', '123456789', 'Melina@email', '(18) 99807-8292', 'Rua Domingos Vieira e Silva, 95', 'Presidente Prudente', '', 'G4ipMRPaqajVUbTe9PA+ztQvoeCpa1ldPqeIXfHmtls='),
	(11, '111111111111', '2008-11-18', '11111111111', '111111111', 'joao@gmail', '(11) 11111-1111', 'guarucaia', 'pp', 'RJ', 'umKMVxssXelRLZMrgJSFcoNeLTESgfivDzUqXgNIEKE='),
	(12, 'Joao Campos Estádios', '2001-11-11', '19191919191', '111111111', 'joaocampos@email.com', '(18) 99685-3244', 'rua baianinha', 'baiana', 'SP', '9lt2ZhwfRL2fROfiWBkkOWEYrOezME+4ywza8K3V3jU='),
	(13, 'Pedro Henrique Hildebrando', '2008-07-09', '55555555555', '333333344', 'pedro@gmail.com', '(12) 34567-8798', 'Salvador', 'baiana', '', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI='),
	(14, 'Fernanda Rafaela Silva Vitro', '2026-07-28', '88888888888', '888888888', 'fernanda@aluno.senai.br', '(14) 61276-2167', 'rua baianinha', 'pp', '', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI='),
	(15, 'Bruna Lima', '2009-01-20', '65432234566', '333333333', 'bruna@gmail.com', '(18) 76543-2187', 'alameda das andorinhas', 'alvares machado', 'SP', 'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=');

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.entrevistas: ~7 rows (aproximadamente)
DELETE FROM `entrevistas`;
INSERT INTO `entrevistas` (`id_entrevista`, `id_candidatura`, `data`, `horario`, `tipo_entrevista`, `local_link`) VALUES
	(1, 5, '2026-05-06', '15:30:00', 'presencial', 'Bangú'),
	(2, 5, '2026-05-06', '15:30:00', 'presencial', 'Bangú'),
	(3, 2, '2026-05-06', '15:50:00', 'presencial', 'Bangú'),
	(4, 6, '2026-08-08', '13:15:00', 'presencial', 'buhuhgi'),
	(5, 2, '0000-00-00', '13:33:00', 'presencial', '3333333333'),
	(6, 1, '0990-09-09', '04:44:00', 'presencial', 'buhuhgi'),
	(7, 11, '2056-03-12', '11:27:00', 'presencial', 'centro');

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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.perfil_usuario: ~14 rows (aproximadamente)
DELETE FROM `perfil_usuario`;
INSERT INTO `perfil_usuario` (`id_perfil`, `id_usuario`, `foto_perfil`, `sobre_voce`, `escolaridade`, `instituicao`, `curso`, `habilidades`, `arquivo_pdf`) VALUES
	(2, 2, '1778174710628-15e12f2ac188e47856403c0e78f2895c.jpg', 'sou loira', 'sesi', 'senai', 'dev1', '["bonita","mulher"]', '1777385292957-Documentando meu Navigator.pdf'),
	(3, 3, '1780416407432-IMG_20250812_105202.jpg', 'Adicione uma descrição sobre você', '', '', 'ADM', '["comunicação"]', '1786042892105-_01 - IntroduÃ§Ã£o IoT.pdf'),
	(4, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(5, 5, NULL, 'Adicione uma descrição sobre você', 'hbkjgh', 'gjkhfgkhhk', 'ghfhjfh', '[]', NULL),
	(6, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(7, 7, NULL, 'Auruda', 'Beta', 'Roblox', 'Aura farming', '["passar 100 dias no zombie"]', NULL),
	(8, 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(9, 9, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(10, 10, NULL, 'Adicione uma descrição sobre você', '', '', '', '[]', NULL),
	(11, 11, NULL, 'Adicione uma descrição sobre você', '', '', '', '[]', NULL),
	(12, 12, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(13, 13, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(14, 14, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(15, 15, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.vagas_candidatar: ~9 rows (aproximadamente)
DELETE FROM `vagas_candidatar`;
INSERT INTO `vagas_candidatar` (`id_candidatura`, `id_vaga`, `id_usuario`, `status`, `data_candidatura`) VALUES
	(1, 2, 2, '', '2026-04-30 15:18:41'),
	(2, 1, 2, '', '2026-04-30 15:34:18'),
	(4, 4, 2, '', '2026-05-07 14:25:18'),
	(5, 4, 3, '', '2026-05-07 14:29:11'),
	(6, 6, 5, '', '2026-08-06 09:10:37'),
	(7, 6, 7, '', '2026-08-06 13:15:36'),
	(8, 10, 7, '', '2026-08-06 13:33:23'),
	(9, 9, 7, '', '2026-08-06 13:33:25'),
	(10, 17, 10, '', '2026-08-06 15:40:08'),
	(11, 18, 10, '', '2026-08-06 15:45:55'),
	(12, 19, 2, '', '2026-08-18 15:50:30'),
	(13, 18, 2, '', '2026-08-18 15:50:35');

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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Copiando dados para a tabela siep.vagas_criar: ~8 rows (aproximadamente)
DELETE FROM `vagas_criar`;
INSERT INTO `vagas_criar` (`id_vaga`, `id_empresa`, `titulo_vaga`, `tipo`, `modalidade`, `area`, `descricao`, `cidade`, `uf`, `salario`, `idade_minima`, `idade_maxima`, `requisitos`) VALUES
	(1, 2, 'Teste 1', 'Estágio', 'Remoto', 'Tecnologia', 'Teste para ver se da certo 11:17', 'presidente prudente', 'PA', 1800.00, 14, 20, 'bonito'),
	(2, 2, 'Teste 2', 'Estágio', 'Remoto', 'Tecnologia', 'Teste para ver se da certo 11:20', 'presidente prudente', 'AP', 2000.00, 14, 20, 'bonito, inteligente'),
	(4, 2, 'teste 3', 'Jovem Aprendiz', 'Presencial', 'Indústria', 'teste de 07/05', 'presidente prudente', 'MG', 3000.00, 20, 30, '[]'),
	(6, 4, 'cabeleleira leila', 'Estágio', 'Híbrido', 'Selecione a área', '', '', 'UF', 0.00, 14, 24, ''),
	(9, 5, 'Treinador de aura', 'Jovem Aprendiz', 'Híbrido', 'Alimentação', 'Ensinando para alimentar-se como um sigma', 'Presidente Prudente', 'UF', 0.00, 14, 24, 'Ser sigma'),
	(10, 5, 'Treinador de aura', 'Jovem Aprendiz', 'Híbrido', 'Alimentação', '', 'Presidente Prudente', 'UF', 0.00, 14, 24, '[]'),
	(17, 2, 'Treinador de aura', 'Estágio', 'Híbrido', 'Educação', 'SSSSSSSSSSSSSSSS', 'Presidente Prudente', 'AC', 99999999.99, 14, 24, 'EEE'),
	(18, 9, 'senai', 'Estágio', 'Presencial', 'Tecnologia', '.,,,,', 'Presidente Prudente', 'SP', 3000.00, 17, 24, '12'),
	(19, 9, 'w', 'Estágio', 'Remoto', 'Varejo', '3333', 'Presidente prudente', 'AP', 33333.00, 14, 24, '3333');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
