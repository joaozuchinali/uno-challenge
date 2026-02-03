import { Link } from "react-router-dom";
import { Add, Delete, Edit } from "@mui/icons-material";
import { Fab, Modal, Fade, Box, Typography, Backdrop, TextField, Button, IconButton } from "@mui/material";
import { useMutation, useQuery } from "@apollo/client";
import { getOperationName } from "@apollo/client/utilities";
import { GridContainer, Header, Main, Card, CardActions } from "../../styles/comps-home";
import { useState, useContext } from "react";
import { GET_TODO_LISTS, ADD_TODO_LIST_MUTATION, DELETE_TODO_LIST_MUTATION, UPDATE_TODO_LIST_MUTATION } from "../../queries/listas";
import { DefaultContext } from "../../context/ctx";
import DialogWrapper from "../../util/dialog-wrapper";

const modalStyle = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
};

export default function Home() {
	const [isEdit, setIsEdit] = useState({ status: false, data: null });
	const [open, setOpen] = useState(false);

	const [listName, setListName] = useState("");
	const [error, setError] = useState(null);
	const { setCtxData, ctxData } = useContext(DefaultContext);
	const { data, loading } = useQuery(GET_TODO_LISTS);

	// Request para adicionar uma nova lista
	const [addTodoList] = useMutation(ADD_TODO_LIST_MUTATION, {
		awaitRefetchQueries: true,
		refetchQueries: [getOperationName(GET_TODO_LISTS)],
		onError: (error) => {
			const errorMessage = error.graphQLErrors?.[0]?.message || error.message;
			setError(errorMessage);
		}
	});

	// Request para remover uma lista 
	const [deleteTodoList] = useMutation(DELETE_TODO_LIST_MUTATION, {
		awaitRefetchQueries: true,
		refetchQueries: [getOperationName(GET_TODO_LISTS)],
		onError: (error) => {
			const errorMessage = error.graphQLErrors?.[0]?.message || error.message;
			setError(errorMessage);
		}
	});

	// Request para atualizar uma lista
	const [editTodoList] = useMutation(UPDATE_TODO_LIST_MUTATION, {
		awaitRefetchQueries: true,
		refetchQueries: [getOperationName(GET_TODO_LISTS)],
		onError: (error) => {
			const errorMessage = error.graphQLErrors?.[0]?.message || error.message;
			setError(errorMessage);
		}
	});

	// Função para abrir o dialog
	const showDialog = (title, message, buttons) => {
		setCtxData((prev) => ({
			...prev,
			dialog: {
				title,
				message,
				buttons
			}
		}));
	}

	// Evento de salvar disparado pelo modal
	const handleSave = async () => {
		if (!listName.trim()) {
			setError("O nome da lista não pode estar vazio!");
			return;
		}

		if (isEdit.status) {
			handleEditSave();
			return;
		}

		await addTodoList({
			variables: { name: listName },
			onCompleted: () => {
				setListName("");
				setError(null);
				setOpen(false);
			}
		});
	};
	// Nos casos de ser uma edição de nome de uma lista cai nessa função para atualização dos dados
	const handleEditSave = async () => {
		await editTodoList({
			variables: { id: isEdit.data.id, name: listName },
			onCompleted: () => {
				setListName("");
				setError(null);
				setOpen(false);
			},
			onError: (error) => {
				const errorMessage = error.graphQLErrors?.[0]?.message || error.message;
				setError(errorMessage);
			}
		});
	};

	// Evento de cancelar disparado pelo modal, fecha o modal e limpa os campos
	const handleCancel = () => {
		setListName("");
		setError(null);
		setOpen(false);
		if (isEdit.status) {
			setIsEdit({ status: false, data: null });
		}
	};

	// Evento disparado pelo botão de deletar, abre um dialog para confirmar a exclusão
	const handleDelete = async (id) => {
		showDialog("Confirmar exclusão", "Deseja realmente deletar esta lista?", {
			confirm: () => {
				deleteTodoList({ variables: { id } });
				setCtxData((prev) => ({ ...prev, dialog: false }));
			},
			close: true
		});
	};

	// Evento disparado pelo botão de editar de um card, abre o modal mas em modo de edição
	const handleEdit = async (id) => {
		const registro = data?.todoLists?.find((list) => list.id === id);
		setIsEdit({ status: true, data: registro });
		setListName(registro.name);
		setOpen(true);
	};

	return (
		<>
			<GridContainer>
				<Header>
					Gerenciador de listas
					<Fab
						color="primary"
						sx={{
							position: 'absolute',
							right: 16,
							top: '50%',
							transform: 'translateY(-50%)',
							borderRadius: '8px'
						}}
						onClick={() => setOpen(true)}
					> <Add /> </Fab>
				</Header>

				<Main>
					{loading && <Typography color="#FFFFFF">Carregando...</Typography>}
					{!loading && (!data || data?.todoLists?.length === 0) && (
						<Typography variant="h6" color="#FFFFFF">
							Nenhuma lista encontrada. Clique no botão + para criar uma nova lista.
						</Typography>
					)}
					{!loading && data?.todoLists?.map((list) => (
						<Card key={list.id}>

							<Link to={`/list/${list.id}`} state={{ name: list.name }}>{list.name}</Link>
							<CardActions>
								<IconButton color="primary" onClick={() => handleEdit(list.id)}>
									<Edit />
								</IconButton>
								<IconButton
									color="error"
									onClick={(e) => handleDelete(list.id)}
								> <Delete /> </IconButton>
							</CardActions>
						</Card>
					))}
				</Main>
			</GridContainer>

			<Modal
				open={open}
				onClose={handleCancel}
				closeAfterTransition
				slots={{ backdrop: Backdrop }}
				slotProps={{
					backdrop: {
						timeout: 500,
					},
				}}
			>
				<Fade in={open}>
					<Box sx={modalStyle}>
						<Typography variant="h6" component="h2">
							{!isEdit.status ? "Adicionar nova todo list" : "Editar nome da lista"}
						</Typography>

						<TextField
							label="Nome da lista"
							value={listName}
							type="text"
							variant="standard"
							sx={{ width: "100%", mt: 2 }}
							onChange={(e) => setListName(e.target.value)}
							error={!!error}
							helperText={error}
						/>

						<Box sx={{ display: "flex", gap: 2, mt: 3 }}>
							<Button variant="contained" color="success"
								onClick={() => !isEdit.status ? handleSave() : handleEditSave()}>Salvar</Button>
							<Button variant="contained" color="error" onClick={handleCancel}>Cancelar</Button>
						</Box>
					</Box>
				</Fade>
			</Modal>

			{ctxData.dialog && <DialogWrapper />}
		</>
	);
}