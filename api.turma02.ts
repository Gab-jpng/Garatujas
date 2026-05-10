import todo from "./core.ts"; // Importa o módulo principal de gerenciamento de TODOs (funções addItem, getItems, etc.)

const server = Bun.serve({ // Cria e inicia o servidor HTTP usando Bun.serve
  port: 3000, // Define a porta do servidor (3000)

  routes: { // Define todas as rotas da API e página principal
    "/": new Response(Bun.file("./public/index.html")), // Rota raiz: serve o arquivo HTML estático da pasta public

    "/api/todo": { // Rota para operações CRUD básicas da lista de TODOs
      GET: async () => { // GET /api/todo - Lista todos os itens
        const items = await todo.getItems(); // Busca todos os itens da lista
        return Response.json(items); // Retorna os itens como JSON
      },

      POST: async (req) => { // POST /api/todo - Adiciona novo item
        const data = await req.json() as any; // Lê o corpo da requisição como JSON
        const item = data.item || null; // Extrai o campo 'item' do corpo da requisição
        if (!item) // Valida se o campo 'item' foi fornecido
          return Response.json('Por favor, forneça um item para adicionar.', { status: 400 }); // Retorna erro 400 se item não fornecido
        await todo.addItem(item); // Adiciona o item à lista (salva automaticamente no arquivo)
        return Response.json(data); // Retorna os dados recebidos como confirmação
      },
    },

    "/api/todo/:index": { // Rota para operações em item específico por índice (:index é parâmetro dinâmico)
      PUT: async (req) => { // PUT /api/todo/:index - Atualiza item específico
        const index = parseInt(req.params.index); // Converte o parâmetro :index para número inteiro
        if (isNaN(index)) // Valida se o índice é um número válido
          return Response.json('Índice inválido. um número inteiro é esperado.', { status: 400 }); // Erro 400 para índice inválido
        const data = await req.json() as any; // Lê o corpo da requisição como JSON
        const newItem = data.newItem || null; // Extrai o campo 'newItem' do corpo
        if (!newItem) // Valida se o novo item foi fornecido
          return Response.json('Por favor, forneça um novo item para atualizar.', { status: 400 }); // Erro 400 se newItem não fornecido
        try {
          await todo.updateItem(index, newItem); // Tenta atualizar o item no índice especificado
          return Response.json(`Item no índice ${index} atualizado para "${newItem}".`); // Sucesso: confirmação da atualização
        } catch (error: any) { // Captura erro do core (ex: índice fora dos limites)
          return Response.json(error.message, { status: 400 }); // Retorna mensagem de erro com status 400
        }
      },

      DELETE: async (req) => { // DELETE /api/todo/:index - Remove item específico
        const index = parseInt(req.params.index); // Converte o parâmetro :index para número inteiro
        if (isNaN(index)) // Valida se o índice é um número válido
          return Response.json('Índice inválido.', { status: 400 }); // Erro 400 para índice inválido
        try {
          await todo.removeItem(index); // Tenta remover o item no índice especificado
          return Response.json(`Item no índice ${index} removido com sucesso.`); // Sucesso: confirmação da remoção
        } catch (error: any) { // Captura erro do core (ex: índice fora dos limites)
          return Response.json(error.message, { status: 400 }); // Retorna mensagem de erro com status 400
        }
      },
    },

    // EXEMPLO BÁSICO // Comentário: início da seção de exemplo básico de rotas

    "/api/exemplo": { // Rota de exemplo básico para demonstrar padrões REST
      GET: () => { // GET /api/exemplo - Resposta simples com timestamp
        return new Response(`Esse é o exemplo: ${Date.now()}`); // Retorna timestamp atual como texto
      },

      POST: async (req) => { // POST /api/exemplo - Recebe e modifica dados JSON
        const data = await req.json() as any; // Lê corpo JSON da requisição
        data.recebidoEm = new Date().toLocaleDateString("pt-BR"); // Adiciona timestamp de recebimento formatado PT-BR
        return Response.json(data); // Retorna os dados modificados como JSON
      },
    },

    "/api/exemplo/:id": { // Rota de exemplo com parâmetro dinâmico :id
      PUT: async (req, params) => { // PUT /api/exemplo/:id - Atualização completa
        const { id } = req.params; // Extrai parâmetro :id da URL
        const data = await req.json() as any; // Lê corpo JSON
        data.id = id; // Define o ID do recurso
        data.recebidoEm = new Date().toLocaleDateString("pt-BR"); // Adiciona timestamp de recebimento
        return Response.json(data); // Retorna dados processados
      },

      PATCH: async (req, params) => { // PATCH /api/exemplo/:id - Atualização parcial
        const { id } = req.params; // Extrai parâmetro :id da URL
        const data = await req.json() as any; // Lê corpo JSON (apenas campos a atualizar)
        data.chavesAtualizadas = Object.keys(data); // Lista chaves que foram enviadas (atualizadas)
        data.id = id; // Define o ID do recurso
        data.atualizadoEm = new Date().toLocaleDateString("pt-BR"); // Adiciona timestamp de atualização
        return Response.json(data); // Retorna dados processados com metadados
      },

      DELETE: (req, params) => { // DELETE /api/exemplo/:id - Remoção lógica
        const { id } = req.params; // Extrai parâmetro :id da URL
        return new Response(`Recurso com id ${id} deletado`, { status: 200 }); // Simula deleção retornando status 200
      }
    } // FIM DO EXEMPLO BÁSICO // Comentário: fim da seção de exemplo básico
  },

  async fetch(req) { // Função fallback executada para rotas não definidas nas routes
    return new Response(`Not Found`, { status: 404 }); // Retorna 404 para qualquer rota não mapeada
  },
});

console.log(`Server running at http://localhost:${server.port}`); // Loga URL do servidor com a porta real usada
