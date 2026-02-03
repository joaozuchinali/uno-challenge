// Definição do schema
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

module.exports = {
	typeDefs
};