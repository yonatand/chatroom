import json
from datetime import datetime
from socket import socket
from typing import Tuple

from .server import socket_manager


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
