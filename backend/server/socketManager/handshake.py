import base64
import hashlib
from socket import socket
from typing import Tuple

from logs import logger

HANDSHAKE_RESPONSE = (
    "HTTP/1.1 101 Switching Protocols\r\n"
    "Upgrade: websocket\r\n"
    "Connection: Upgrade\r\n"
    "Sec-WebSocket-Accept: {accept_key}\r\n\r\n"
)


# Function to handle WebSocket upgrade requests
def perform_handshake(
    client_socket: socket, client_address: Tuple[str, int], request: str
):
    """
    Perform a handshake with a socket requesting upgrade with HTTP

    Function generated by ChatGPT

    :param client_socket: The socket object
    :param client_address: The unique address of a client
    :param request: plain text on the HTTP request
    """
    headers = {}
    for line in request.split("\r\n")[1:]:
        if ": " in line:
            key, value = line.split(": ", 1)
            headers[key] = value

    if "Sec-WebSocket-Key" not in headers:
        logger.error(f"Bad WebSocket request from {client_address}")
        return False

    # Create the Sec-WebSocket-Accept key
    websocket_key = headers["Sec-WebSocket-Key"]
    accept_key = base64.b64encode(
        hashlib.sha1(
            (websocket_key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").encode("utf-8")
        ).digest()
    ).decode("utf-8")

    # Send the handshake response
    handshake_response = HANDSHAKE_RESPONSE.format(accept_key=accept_key)
    client_socket.send(handshake_response.encode("utf-8"))
    logger.info(f"WebSocket connection established with {client_address}")
    return True
