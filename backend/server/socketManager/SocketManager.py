import json
from socket import socket
from typing import Any, Callable, Dict, Tuple

from logs import logger

from .frameUtil import create_frame, decode_websocket_message
from .handshake import perform_handshake


class SocketManager:
    def __init__(
        self, unregister_callback_fn: Callable[[Tuple[str, int]], None] = None
    ):
        self.user_dict: Dict[Tuple[str, int], Dict[str, Any]] = {}
        self.unregister_callback_fn = unregister_callback_fn

    def __get_socket(self, client_addr: Tuple[str, int]) -> socket | None:
        if client_addr in self.user_dict:
            return self.user_dict[client_addr]["socket"]
        return None

    def register_socket(self, client_addr: Tuple[str, int], socket: socket):
        if client_addr in self.user_dict:
            raise ""  # TODO: add an exception
        self.user_dict[client_addr] = {}
        self.user_dict[client_addr]["socket"] = socket

    def unregister_socket(self, client_addr: Tuple[str, int]):
        if self.unregister_callback_fn:
            self.unregister_callback_fn(client_addr)
        self.user_dict.pop(client_addr, None)

    def read_client_data(self, client_addr: Tuple[str, int], key: str = None):
        if client_addr not in self.user_dict:
            raise ""  # TODO: add an exception
        if key:
            if key not in self.user_dict[client_addr]:
                return None
            return self.user_dict[client_addr][key]
        return self.user_dict[client_addr]

    def write_client_data(self, client_addr: Tuple[str, int], key: str, value: Any):
        if key == "socket":
            raise ""  # TODO: add an exception
        if client_addr not in self.user_dict:
            raise ""  # TODO: add an exception
        self.user_dict[client_addr][key] = value

    def read_all_data_by_key(self, key: str):
        if key == "socket":
            raise ""  # TODO: add an exception
        return [
            inner_dict[key]
            for inner_dict in self.user_dict.values()
            if key in inner_dict
        ]

    def read_from_socket(
        self,
        client_addr: Tuple[str, int],
        callback_fn: Callable[[Tuple[str, int], Any], None],
    ):
        socket = self.__get_socket(client_addr)
        if socket is None:
            raise ""  # TODO: add an exception
        try:
            while True:
                data = socket.recv(1024)  # Read from socket
                if not data:
                    break
                decoded_data = decode_websocket_message(data)
                if decoded_data["message_type"] == "Close":
                    break
                if decoded_data[
                    "message_type"
                ] == "Unsupported" and "Upgrade: websocket" in data.decode("utf-8"):
                    if not perform_handshake(socket, client_addr, data.decode("utf-8")):
                        logger.error(f"Failed WebSocket handshake with {client_addr}")
                        break
                    else:
                        continue
                elif decoded_data["message_type"] == "Unsupported":
                    socket.send(b"HTTP/1.1 400 Bad Request\r\n\r\n")
                    break
                logger.info(
                    f"""Client {client_addr} sent: {json.loads(decoded_data["message"])}"""
                )
                callback_fn(client_addr, decoded_data["message"])
        except Exception as e:
            logger.error(f"Exception: {e}")
        finally:
            socket.close()
            self.unregister_socket(client_addr)
            logger.info(f"Connection with {client_addr} closed.")

    def write_to_socket(self, client_addr: Tuple[str, int], data: str):
        socket = self.__get_socket(client_addr)
        if socket is None:
            raise ""  # TODO: add an exception
        logger.info(f"Server sent to {client_addr}: {data}")
        socket.send(create_frame(data))

    def broadcast(self, data: str, client_addr: Tuple[str, int] = None):
        """
        Broadcast data to all connected sockets

        :param data: The data to broadcast
        :param client_addr: Optional client to not broadcast to (broadcast initiator)
        """
        logger.info(f"Server broadcast: {data}")
        for client_key, client_value in self.user_dict.items():
            if client_key == client_addr:
                continue
            client_value["socket"].send(create_frame(data))
