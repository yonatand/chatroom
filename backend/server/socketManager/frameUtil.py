import struct


def create_frame(data_str: str):
    """
    function generated by ChatGPT to encode plain text data into websocket message
    """
    # Ensure the data is encoded in UTF-8
    data = data_str.encode("utf-8")

    # Frame header
    frame_header = bytearray()

    # FIN (1 bit), RSV1 (1 bit), RSV2 (1 bit), RSV3 (1 bit), Opcode (4 bits)
    frame_header.append(
        0b10000001
    )  # FIN=1, RSV1=0, RSV2=0, RSV3=0, Opcode=0x1 (text frame)

    # Payload length (7 bits)
    payload_length = len(data)
    if payload_length <= 125:
        frame_header.append(payload_length)
    elif payload_length <= 65535:
        frame_header.append(126)
        frame_header.extend(struct.pack("!H", payload_length))  # 2-byte length
    else:
        frame_header.append(127)
        frame_header.extend(struct.pack("!Q", payload_length))  # 8-byte length

    # Append the payload data
    frame_header.extend(data)

    return frame_header


def decode_websocket_message(frame: bytes):
    """
    function generated by ChatGPT to decode a websocket message into plain text
    """
    byte_array = bytearray(frame)

    # Check the opcode
    opcode = byte_array[0] & 0x0F

    if opcode == 0x1:
        # Text frame
        message_type = "Text"
    elif opcode == 0x8:
        # Close frame
        message_type = "Close"
    else:
        return {"message_type": "Unsupported"}

    # Get the payload length
    length = byte_array[1] & 0x7F
    mask_start = 2

    if length == 126:
        length = int.from_bytes(byte_array[2:4], "big")
        mask_start = 4
    elif length == 127:
        length = int.from_bytes(byte_array[2:10], "big")
        mask_start = 10

    # Extract mask key
    mask = byte_array[mask_start : mask_start + 4]

    # Extract payload
    payload = byte_array[mask_start + 4 :]

    # Unmask the payload
    unmasked = bytearray(length)
    for i in range(length):
        unmasked[i] = payload[i] ^ mask[i % 4]

    if message_type == "Text":
        # Decode the payload as UTF-8 for text frames
        return {"message_type": message_type, "message": unmasked.decode("utf-8")}
    elif message_type == "Close":
        if len(unmasked) >= 2:
            # Extract close status code
            status_code = int.from_bytes(unmasked[:2], "big")
            reason = unmasked[2:].decode("utf-8") if len(unmasked) > 2 else ""
            return {
                "message_type": message_type,
                "status": status_code,
                "reason": reason,
            }
        else:
            return {"message_type": message_type}
