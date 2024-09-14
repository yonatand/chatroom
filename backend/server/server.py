import json
import sys
import threading
from datetime import datetime
from socket import AF_INET, SOCK_STREAM, socket
from typing import Tuple

from logs.log import logger

from .consts import MAX_SOCKETS
from .SocketManager import SocketManager


def handle_client_disconnect(client_address: Tuple[str, int]):
    disconnected_username = socket_manager.read_client_data(client_address, "username")
    if disconnected_username:
        socket_manager.broadcast(
            json.dumps({"event": "logout", "username": disconnected_username}),
            client_address,
        )


socket_manager = SocketManager(handle_client_disconnect)


# TODO: exception handling
def handle_read_client(client_address: Tuple[str, int], data_str: str):
    data = json.loads(data_str)
    if data["event"] == "login" and isinstance(data["username"], str):
        username_list = socket_manager.read_all_data_by_key("username")
        if data["username"] in username_list:
            socket_manager.write_to_socket(
                client_address,
                json.dumps({"event": "error", "message": "Duplicate username"}),
            )
            return
        socket_manager.write_client_data(client_address, "username", data["username"])
        socket_manager.broadcast(
            json.dumps({"event": "login", "username": data["username"]}), client_address
        )
        username_list.append(data["username"])
        socket_manager.write_to_socket(
            client_address, json.dumps({"event": "userList", "data": username_list})
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


def get_port():
    if len(sys.argv) < 2:
        raise Exception("Port number needs to pass as an argument")
    if not sys.argv[1].isnumeric():
        raise Exception("Port number needs to be numeric")
    return int(sys.argv[1])


if __name__ == "__main__":
    port = get_port()
    server_socket = socket(AF_INET, SOCK_STREAM)
    server_socket.bind(("localhost", port))
    server_socket.listen(MAX_SOCKETS)
    logger.debug("Server is listening...")

    while True:
        client_socket, client_address = server_socket.accept()
        client_thread = threading.Thread(
            target=handle_client,
            args=(client_socket, client_address),
        )
        client_thread.start()
