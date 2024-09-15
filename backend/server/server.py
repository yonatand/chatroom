import json
import sys
import threading
from datetime import datetime
from socket import AF_INET, SOCK_STREAM, socket
from typing import Tuple

from logs import logger
from socket_manager import SocketManager

MAX_SOCKETS = 5


def handle_client_disconnect(client_address: Tuple[str, int]):
    """
    Logic that runs on client disconnect

    Sends logout broadcast

    :param client_address: The unique address of a client
    """
    try:
        disconnected_username = socket_manager.read_client_data(
            client_address, "username"
        )
        if disconnected_username:
            socket_manager.broadcast(
                json.dumps({"event": "logout", "username": disconnected_username}),
                client_address,
            )
    except Exception:
        # If an exception is thrown then the user doesn't exists,
        # not action needed
        pass


socket_manager = SocketManager(handle_client_disconnect)


def handle_read_client(client_address: Tuple[str, int], data_str: str):
    """
    Buisness logic of socket packets handling

    Handles Login event and Message event

    :param client_address: The unique address of a client
    :param data_str: Data from client in string format
    """
    try:
        data = json.loads(data_str)
        if data["event"] == "login" and isinstance(data["username"], str):
            username_list = socket_manager.read_all_data_by_key("username")
            if data["username"] in username_list:
                socket_manager.write_to_socket(
                    client_address,
                    json.dumps({"event": "error", "message": "Duplicate username"}),
                )
                return
            socket_manager.write_client_data(
                client_address, "username", data["username"]
            )
            socket_manager.broadcast(
                json.dumps({"event": "login", "username": data["username"]}),
                client_address,
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
    except Exception:
        logger.error(f"handle_read_client failure for {client_address}")


def handle_client(
    client_socket: socket,
    client_address: Tuple[str, int],
):
    """
    Entry function for client thread

    :param client_socket: The socket of the client
    :param client_address: The unique address of a client
    """
    socket_manager.register_socket(client_address, client_socket)
    socket_manager.read_from_socket(client_address, handle_read_client)


def get_port():
    """
    Get startup port from arguments
    """
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
