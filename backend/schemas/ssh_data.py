from Crypto.PublicKey import ECC
from beanie import Document


class SSHData(Document):
    id: str
    public_key: str
    private_key: str

    def update_key(self):
        key = ECC.generate(curve="p256")
        self.public_key = key.export_key(format="PEM")
        self.private_key = key.public_key().export_key(format="OpenSSH")


def generate_ssh_data(user_id: str) -> SSHData:
    key = ECC.generate(curve="p256")
    public_key = key.export_key(format="PEM")
    private_key = key.public_key().export_key(format="OpenSSH")

    return SSHData(
        id=user_id,
        public_key=public_key,
        private_key=private_key
    )
