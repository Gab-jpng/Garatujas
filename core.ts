const jsonFilePath = __dirname + '/data.temp.json'; // Define o caminho completo do arquivo JSON temporário usando o diretório atual do script (__dirname)
const list: string[] = await loadFromFile(); // Carrega a lista de strings do arquivo ao inicializar o módulo (list é compartilhada entre todas as funções)


async function loadFromFile() {
  try { // Inicia bloco try-catch para tratar erros durante a leitura do arquivo
    const file = Bun.file(jsonFilePath); // Cria um objeto File do Bun apontando para o caminho do arquivo JSON
    const content = await file.text(); // Lê o conteúdo do arquivo como texto
    return JSON.parse(content) as string[]; // Faz a leitura do conteúdo JSON e faz cast para array de strings
  } catch (error: any) { // Captura qualquer erro que ocorra durante a leitura(parse)
    if (error.code === 'ENOENT') // Se o erro for "arquivo não encontrado" (ENOENT), retorna array vazio
      return [];
    throw error; // Para outros erros, mostra o erro original
  }
}


async function saveToFile() {
  try { // Inicia bloco try-catch para tratar erros durante a escrita
    await Bun.write(jsonFilePath, JSON.stringify(list)); // Escreve o conteúdo da lista (convertido para JSON) no arquivo
  } catch (error: any) { // Captura qualquer erro que ocorra durante a escrita
   throw new Error("Erro ao salvar os dados no arquivo: " + error.message);
  }
}


async function addItem(item: string) {
  list.push(item); // Adiciona o novo item no final da lista
  await saveToFile(); // Salva a lista atualizada no arquivo
}


async function getItems() {
  return list; // Retorna a lista atual
}


async function updateItem(index: number, newItem: string) {
  if (index < 0 || index >= list.length)
    throw new Error("Index fora dos limites");
  list[index] = newItem; // Substitui o item no índice especificado pelo novo valor
  await saveToFile();
}


async function removeItem(index: number) {
  if (index < 0 || index >= list.length) // Valida se o índice está dentro dos limites da lista
    throw new Error("Index fora dos limites");
  list.splice(index, 1); // Remove 1 item na posição do índice especificado
  await saveToFile();
}


export default { addItem, getItems, updateItem, removeItem };  // Exporta as funções principais como um objeto padrão para uso em outros módulos
