import asyncio
import threading
from socket import AF_INET, SOCK_STREAM, socket
from typing import Dict, Tuple

from .consts import MAX_SOCKETS, PORT
from .SocketManager import SocketManager

socket_manager = SocketManager()
username_to_client: Dict[str, Tuple[str, int]] = {}


def handle_read_client(client_address: Tuple[str, int], data: str):
    print(f"Client {client_address} sent: {data}")
    # socket_manager.write_to_socket(client_address, b"recived.")


def handle_client(
    client_socket: socket,
    client_address: Tuple[str, int],
):
    socket_manager.register_socket(client_address, client_socket)
    asyncio.run(socket_manager.read_from_socket(client_address, handle_read_client))


if __name__ == "__main__":
    server_socket = socket(AF_INET, SOCK_STREAM)
    server_socket.bind(("localhost", PORT))
    server_socket.listen(MAX_SOCKETS)
    print("Server is listening...")

    while True:
        client_socket, client_address = server_socket.accept()
        client_thread = threading.Thread(
            target=handle_client,
            args=(client_socket, client_address),
        )
        client_thread.start()
