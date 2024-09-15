class SocketManagerException(Exception):
    """
    Exception in SocketManager
    """

    def __init__(self, message):
        super().__init__(message)
