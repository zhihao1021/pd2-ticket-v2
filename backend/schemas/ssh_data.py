from Crypto.PublicKey import ECC
from beanie import Document


class SSHData(Document):
    id: str
    username: str
    public_key: str
    private_key: str

    def update_key(self):
        key = ECC.generate(curve="p256")
        self.private_key = key.export_key(format="PEM")
        self.public_key = key.public_key().export_key(format="OpenSSH")


def generate_ssh_data(user_id: str, username: str) -> SSHData:
    key = ECC.generate(curve="p256")
    private_key = key.export_key(format="PEM")
    public_key = key.public_key().export_key(format="OpenSSH")

    return SSHData(
        id=user_id,
        username=username,
        private_key=private_key,
        public_key=public_key,
    )
