import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Container, Card, Form, Button, ListGroup } from "react-bootstrap";
const userId = localStorage.getItem("userId");
const socket = io("http://localhost:5000", {
  reconnectionDelayMax: 10000,
  auth: {
    token: "123",
  },
  query: {
    username: userId,
  },
});
const Main = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [rooms, setRooms] = useState<{ [key: string]: any }>({});
  useEffect(() => {
    socket.on("updateRooms", (rooms) => {
      setRooms(rooms);
    });
  }, []);

  // Create a new room by emitting a socket event
  const handleCreateRoom = () => {
    if (roomId.trim()) {
      socket.emit("createRoom", roomId);
    }
  };

  // Join an existing room and navigate to the game page
  const handleJoinRoom = (room: string) => {
    socket.emit("joinRoom", room);
    navigate(`/game?room=${room}&username=${userId}`);
  };
  return (
    <Container
      fluid
      className="d-flex flex-column justify-content-center align-items-center vh-100"
      style={{ background: "linear-gradient(135deg, #000000, #434343)" }}
    >
      {/* Create Room Card */}
      <Card
        style={{
          width: "400px",
          backgroundColor: "#3a3a3a",
          border: "2px solid #ff9800",
        }}
        className="mb-4"
      >
        <Card.Header style={{ backgroundColor: "#ff9800", color: "#fff" }}>
          Room Management
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: "#ff9800" }}>Create a Room</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter room name"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                style={{
                  backgroundColor: "#222",
                  color: "#fff",
                  border: "1px solid #ff9800",
                }}
              />
            </Form.Group>
            <Button variant="warning" onClick={handleCreateRoom} className="w-100">
              Create Room
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Available Rooms Card */}
      <Card
        style={{
          width: "400px",
          backgroundColor: "#3a3a3a",
          border: "2px solid #4caf50",
        }}
      >
        <Card.Header style={{ backgroundColor: "#4caf50", color: "#fff" }}>
          Available Rooms
        </Card.Header>
        <ListGroup variant="flush">
          {Object.keys(rooms).length === 0 && (
            <ListGroup.Item
              style={{
                backgroundColor: "#3a3a3a",
                color: "#fff",
                borderBottom: "1px solid #4caf50",
              }}
              className="d-flex justify-content-between align-items-center"
            >
              No rooms available.
            </ListGroup.Item>
          )}
          {Object.keys(rooms).map((room) => (
            <ListGroup.Item
              key={room}
              style={{
                backgroundColor: "#3a3a3a",
                color: "#fff",
                borderBottom: "1px solid #4caf50",
              }}
              className="d-flex justify-content-between align-items-center"
            >
              {room}
              <Button
                variant="outline-light"
                size="sm"
                style={{
                  marginLeft: "10px",
                  backgroundColor: "#4caf50",
                  borderColor: "#4caf50",
                }}
                onClick={() => handleJoinRoom(room)}
              >
                Join
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>
    </Container>
  );
};

export default Main;
