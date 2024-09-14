import json
import threading
from datetime import datetime
from socket import AF_INET, SOCK_STREAM, socket
from typing import Tuple

from .consts import MAX_SOCKETS, PORT
from .SocketManager import SocketManager


def handle_client_disconnect(client_address: Tuple[str, int]):
    disconnected_username = socket_manager.read_client_data(client_address, "username")
    socket_manager.broadcast(
        json.dumps({"event": "logout", "username": disconnected_username}),
        client_address,
    )


socket_manager = SocketManager(handle_client_disconnect)


# TODO: exception handling
def handle_read_client(client_address: Tuple[str, int], data_str: str):
    data = json.loads(data_str)
    print(f"Client {client_address} sent: {data}")
    if data["event"] == "login" and isinstance(data["username"], str):
        socket_manager.write_client_data(client_address, "username", data["username"])
        socket_manager.broadcast(
            json.dumps({"event": "login", "username": data["username"]}), client_address
        )
    elif data["event"] == "message" and isinstance(data["data"], str):
        username: str = socket_manager.read_client_data(client_address, "username")
        socket_manager.broadcast(
            json.dumps(
                {
                    "event": "message",
                    "username": username,
                    "data": data["data"],
                    "time": datetime.now().isoformat(),
                }
            ),
        )


def handle_client(
    client_socket: socket,
    client_address: Tuple[str, int],
):
    socket_manager.register_socket(client_address, client_socket)
    socket_manager.read_from_socket(client_address, handle_read_client)


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
