const { GraphQLError } = require("graphql");
const { TODO_LISTS } = require("./makeData");
const { setIdList, getCurrentList, setCurrentList, getRandomInt, getIndexById, checkItemExists, checkListExists } = require("../utils/array");

/**
 * Query: Retorna uma lista específica com filtro opcional de itens
 */
function todoList(_, { filter, id }) {
	try {
		setIdList(id);
		const list = getCurrentList();
		if (filter && filter.name) {
			const needle = filter.name.toLowerCase();
			const items = list.items.filter(e => e.name.toLowerCase().includes(needle));
			const aux = { ...list, items };
			return aux;
		}

		return list;
	} catch (error) {
		throw new GraphQLError("Erro ao buscar listas disponíveis!", {
			extensions: {
				code: 'ERRO_BUSCAR_LISTA'
			}
		});
	}
}

/**
 * Retorna todas as listas
 */
function todoLists() {
	return TODO_LISTS;
}

/**
 * Adiciona um novo item na lista atual
 */
function addItem(_, { values: { name } }) {
	if (checkItemExists(name)) {
		throw new GraphQLError("Um item de mesmo nome foi encontrado na todo-list!", {
			extensions: {
				code: 'ITEM_EXISTENTE'
			}
		});
	}

	try {
		const list = getCurrentList();
		list.items.push({
			id: getRandomInt(),
			name,
		});
		setCurrentList(list.items);
	} catch (error) {
		throw new GraphQLError("Erro ao adicionar item na lista!", {
			extensions: {
				code: 'ERRO_ADICIONAR_ITEM'
			}
		});
	}
}

/**
 * Atualiza o nome do item da lista atual
 */
function updateItem(_, { values: { id, name } }) {
	try {
		const index = getIndexById(id);
		const list = getCurrentList();
		if (index > -1) {
			if (list.items[index].name !== name && checkItemExists(name)) {
				throw new GraphQLError("Um item de mesmo nome foi encontrado na todo-list!", {
					extensions: {
						code: 'ITEM_EXISTENTE'
					}
				});
			}

			list.items[index].name = name;
			setCurrentList(list.items);
		}
		return true;
	} catch (error) {
		throw new GraphQLError("Erro ao atualizar item na lista!", {
			extensions: {
				code: 'ERRO_ATUALIZAR_ITEM'
			}
		});
	}
}

/**
 * Remove um item da lista atual
 */
function deleteItem(_, { id }) {
	try {
		const index = getIndexById(id);
		const list = getCurrentList();
		if (index > -1) {
			list.items.splice(index, 1);
			setCurrentList(list.items);
		}

		return true;
	} catch (error) {
		throw new GraphQLError("Erro ao tentar deletar item!", {
			extensions: {
				code: 'ERRO_DELETAR_ITEM'
			}
		});
	}
}

/**
 * Adiciona uma nova todo list
 */
function addTodoList(_, { name }) {
	if (checkListExists(name)) {
		throw new GraphQLError("Uma lista com esse nome já existe!", {
			extensions: {
				code: 'LISTA_EXISTENTE'
			}
		});
	}

	try {
		const newList = {
			id: getRandomInt(), name, items: []
		};
		TODO_LISTS.push(newList);
		return newList;
	} catch (error) {
		throw new GraphQLError("Erro ao adicionar lista!", {
			extensions: {
				code: 'ERRO_ADICIONAR_LISTA'
			}
		});
	}
}

/**
 * Atualiza o nome da todo list
 */
function updateTodoList(_, { id, name }) {
	try {
		const index = TODO_LISTS.findIndex(l => l.id === id);
		if (index > -1) {
			if (TODO_LISTS[index].name !== name && checkListExists(name)) {
				throw new GraphQLError("Uma lista com esse nome já existe!", {
					extensions: {
						code: 'LISTA_EXISTENTE'
					}
				});
			}

			TODO_LISTS[index].name = name;
		}
		return true;
	} catch (error) {
		throw new GraphQLError("Erro ao atualizar lista!", {
			extensions: {
				code: 'ERRO_ATUALIZAR_LISTA'
			}
		});
	}
}

/**
 * Deleta uma todo list
 */
function deleteTodoList(_, { id }) {
	try {
		const index = TODO_LISTS.findIndex(l => l.id === id);
		if (index > -1) {
			TODO_LISTS.splice(index, 1);
		}

		return true;
	} catch (error) {
		throw new GraphQLError("Erro ao deletar lista!", {
			extensions: {
				code: 'ERRO_DELETAR_LISTA'
			}
		});
	}
}

const resolvers = {
	Query: {
		todoList,
		todoLists,
	},
	Mutation: {
		addItem,
		updateItem,
		deleteItem,
		addTodoList,
		updateTodoList,
		deleteTodoList,
	},
};

module.exports = {
	resolvers,
	todoList,
	todoLists,
	addItem,
	updateItem,
	deleteItem,
	addTodoList,
	updateTodoList,
	deleteTodoList,
};