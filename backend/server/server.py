import json
import sys
import threading
from socket import AF_INET, SOCK_STREAM, socket
from typing import Tuple

from logs import logger

from .clientFunctions import handle_client
from .consts import MAX_SOCKETS
from .socketManager import SocketManager


def handle_client_disconnect(client_address: Tuple[str, int]):
    disconnected_username = socket_manager.read_client_data(client_address, "username")
    if disconnected_username:
        socket_manager.broadcast(
            json.dumps({"event": "logout", "username": disconnected_username}),
            client_address,
        )


socket_manager = SocketManager(handle_client_disconnect)


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
