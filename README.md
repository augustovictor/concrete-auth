# Desafio node.js Concrete Solutions

![Concrete](src/public/images/concrete.png)

## Aplicação em produção
[https://boiling-tor-41196.herokuapp.com](https://boiling-tor-41196.herokuapp.com)

## Requisitos funcionais
- [x] Todos os endpoints devem somente aceitar e somente enviar JSONs. O servidor deverá retornar JSON para os casos de endpoint não encontrado também.
- [x] Todas as respostas de erro devem retornar o objeto: `{ "mensagem": "mensagem de erro" }`
- [x] `POST /users`: Criação de cadastro
	- Este endpoint deverá receber um usuário com os seguintes campos: nome, email, senha e uma lista de objetos telefone. Seguem os modelos:
	`{ "nome": "string", "email": "string", "senha": "senha", "telefones": [ { "numero": "123456789", "ddd": "11" } ] }`
- [x] Usar status codes de acordo
	- Em caso de sucesso irá retornar um usuário mais os campos:
	- `id`: id do usuário (pode ser o próprio gerado pelo banco, porém seria interessante se fosse um GUID)
	- `data_criacao`: data da criação do usuário
	- `data_atualizacao`: data da última atualização do usuário
	- `ultimo_login`: data do último login (no caso da criação, será a mesma que a criação)
	- `token`: token de acesso da API (pode ser um GUID ou um JWT)
- [x] Caso o e-mail já exista, deverá retornar erro com a mensagem "E-mail já existente".
- [x] O token deverá ser persistido junto com o usuário
- [x] `POST /login`: Sign in
	- Este endpoint irá receber um objeto com e-mail e senha.
	- Caso o e-mail exista e a senha seja a mesma que a senha persistida, retornar igual ao endpoint de sign_up.
	- Caso o e-mail não exista, retornar erro com status apropriado mais a mensagem "Usuário e/ou senha inválidos"
	- Caso o e-mail exista mas a senha não bata, retornar o status apropriado 401 mais a mensagem "Usuário e/ou senha inválidos"
- [x] `GET /users`: Buscar todos os usuários
- [x] `GET /users/:id`: Buscar usuário
	- Chamadas para este endpoint devem conter um header na requisição de Authentication com o valor "Bearer {token}" onde {token} é o valor do token passado na 		criação ou sign in de um usuário.
	- Caso o token não exista, retornar erro com status apropriado com a mensagem "Não autorizado".
	- Caso o token exista, buscar o usuário pelo user_id passado no path e comparar se o token no modelo é igual ao token passado no header.
	- Caso não seja o mesmo token, retornar erro com status apropriado e mensagem "Não autorizado"
	- Caso seja o mesmo token, verificar se o último login foi a MENOS que 30 minutos atrás.
	- Caso não seja a MENOS que 30 minutos atrás, retornar erro com status apropriado com mensagem "Sessão inválida".
	- Caso tudo esteja ok, retornar o usuário.

## Requisitos não funcionais
- [x] Persitência de dados
- [x] Sistema de build Gestão de dependências via gerenciador de pacotes Utilizar um task runner para realização de build
- [x] Padronização de estilo de código em tempo de build - sugestão: jsHint/jsLint
- [x] API: Express

## Requisitos desejáveis
- [x] JWT como token
- [x] Testes unitários
- [x] Criptogafia não reversível (hash) na senha e no token

## Pontos importantes
- O arquivo `config.json` está no repositório apenas para fins de demonstração, uma vez que este deve constar apenas no servidor em produção por motivos de segurança.

## Aprendizado
- Durante o desenvolvimento tive problema com a reindexação do banco para assegurar unicidade do atributo `email`. Pois a aplicação já estava rodando e não identificou a adição do atributo `unique` no atributo do schema do `User`.

## Pontos adicionais
- [x] Documentação feita com [Apidocs](http://apidocjs.com/);