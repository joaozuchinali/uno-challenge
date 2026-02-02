const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { TODO_LISTS } = require("./makeData");
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
 * Atualiza os itens da lista atualatual
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
	return list.items.find(e => e.name.toLowerCase() === name.toLowerCase());
}

/**
 * Check if a todo list with the same name exists
 */
function checkListExists(name) {
	return TODO_LISTS.find(e => e.name.toLowerCase() === name.toLowerCase());
}

const typeDefs = `#graphql
	type Item {
		id: Int
		name: String
	}

	type TodoList {
		id: Int
		name: String
		items: [Item]
	}

	input ItemInput {
		id: Int
		name: String
	}

	input ItemFilter {
		id: Int
		name: String
	}

	type Query {
		todoList(filter: ItemFilter, id: Int): TodoList
		todoLists: [TodoList]
	}

	type Mutation {
		addItem(values: ItemInput): Boolean
		updateItem(values: ItemInput): Boolean
		deleteItem(id: Int!): Boolean

		addTodoList(name: String!): TodoList
		updateTodoList(id: Int!, name: String!): TodoList
		deleteTodoList(id: Int!): Boolean
	}
`;

const resolvers = {
	Query: {
		// Filtro dos itens
		todoList: (_, { filter, id }) => {
			setIdList(id);
			const list = getCurrentList();
			if (filter && filter.name) {
				const needle = filter.name.toLowerCase();
				const items = list.items.filter(e => e.name.toLowerCase().includes(needle));
				const aux = { ...list, items };
				return aux;
			}

			return list;
		},
		todoLists: () => {
			return TODO_LISTS;
		},
	},
	Mutation: {
		// Adiciona um novo item na lista atual
		addItem: (_, { values: { name } }) => {
			if (checkItemExists(name)) {
				return new Error("Um item de mesmo nome foi encontrado na todo-list!");
			}

			const list = getCurrentList();
			list.items.push({
				id: getRandomInt(),
				name,
			});
			setCurrentList(list.items);
		},
		// Atualiza o nome do item da lista atual
		updateItem: (_, { values: { id, name } }) => {
			// Buscando o indice do item no vetor
			const index = getIndexById(id);
			const list = getCurrentList();
			if (index > -1) {
				if (list.items[index].name !== name && checkItemExists(name)) {
					return new Error("Um item de mesmo nome foi encontrado na todo-list!");
				}

				// Atualizando o item
				list.items[index].name = name;
				setCurrentList(list.items);
			}
			return true;
		},
		// Remove um item da lista atual
		deleteItem: (_, { id }) => {
			// Buscando o indice do item no vetor
			const index = getIndexById(id);
			const list = getCurrentList();
			if (index > -1) {
				// Removendo o item do vetor
				list.items.splice(index, 1);
				setCurrentList(list.items);
			}
			return true;
		},


		// Adicionar nova todo list
		addTodoList: (_, { name }) => {
			if (checkListExists(name)) {
				return new Error("Uma lista com esse nome já existe!");
			}

			const newList = {
				id: getRandomInt(), name, items: []
			};
			TODO_LISTS.push(newList);
			return newList;
		},
		updateTodoList: (_, { id, name }) => {
			const index = TODO_LISTS.findIndex(l => l.id === id);
			if (index > -1) {
				if (TODO_LISTS[index].name !== name && checkListExists(name)) {
					return new Error("Uma lista com esse nome já existe!");
				}

				TODO_LISTS[index].name = name;
			}
			return true;
		},
		// Deletar todo list
		deleteTodoList: (_, { id }) => {
			const index = TODO_LISTS.findIndex(l => l.id === id);
			if (index > -1) {
				TODO_LISTS.splice(index, 1);
			}
			return true;
		}
	},
};

// Configuração para subir o backend
const startServer = async () => {
	const server = new ApolloServer({
		typeDefs,
		resolvers,
	});

	const { url } = await startStandaloneServer(server, {
		listen: { port: 4000 },
	});

	console.log(`🚀  Server ready at: ${url}`);
};

startServer();
