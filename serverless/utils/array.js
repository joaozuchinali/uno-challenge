const { TODO_LISTS } = require("../graphql/makeData");

let idList = null;

/**
 * Define o id da lista atual
 */
function setIdList(id) {
	idList = id;
}

/**
 * Retorna os itens da lista atual
 */
function getCurrentList() {
	const list = TODO_LISTS.find(e => e.id === idList);
	return list ? list : { id: null, name: null, items: [] };
}

/**
 * Atualiza os itens da lista atual
 */
function setCurrentList(items) {
	const list = TODO_LISTS.find(e => e.id === idList);
	if (list) {
		list.items = items;
	}
}

/**
 * Gera um número inteiro para utilizar de id
 */
function getRandomInt() {
	return Math.floor(Math.random() * 999);
}

/**
 * Busca o indice de um item pelo id
 */
function getIndexById(id) {
	const list = getCurrentList();
	return list.items.findIndex(e => e.id == id);
}

/**
 * Verifica se um item de mesmo nome ja existe
 */
function checkItemExists(name) {
	const list = getCurrentList();
	return list.items.find(e => e.name === name);
}

/**
 * Verifica se existe uma lista com o mesmo nome
 */
function checkListExists(name) {
	return TODO_LISTS.find(e => e.name === name);
}

module.exports = {
	setIdList,
	getCurrentList,
	setCurrentList,
	getRandomInt,
	getIndexById,
	checkItemExists,
	checkListExists
};