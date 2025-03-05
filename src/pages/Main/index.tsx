import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, ListGroup } from "react-bootstrap";
import { createSocket } from "@/utils/index";
import { Socket } from "socket.io-client";
const userId = localStorage.getItem("userId");
const socket: Socket = createSocket();
const Main = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [rooms, setRooms] = useState<string[]>([]);
  useEffect(() => {
    // Listen for the "Rooms" event once the component mounts.
    socket.on("Rooms", (msg) => {
      console.log("Received Rooms:", msg);
      // Optionally, update state if msg contains room data
      if (msg) {
        setRooms(msg);
      }
    });

    // Optionally listen for "updateRooms" event if needed.
    // socket.on("updateRooms", (rooms) => {
    //   setRooms(rooms);
    // });

    // Clean up the listener on component unmount.
    return () => {
      socket.off("Rooms");
      // socket.off("updateRooms");
    };
  }, []);

  // Create a new room by navigating to /game
  const handleCreateRoom = () => {
    if (roomId.trim()) {
      navigate(`/game?room=${roomId}&username=${userId}&host=true`);
    }
  };

  // Join an existing room and navigate to the game page (logic commented out for now)
  const handleJoinRoom = (room: string) => {
    // socket.emit("joinRoom", room);
    navigate(`/game?room=${room}&username=${userId}&host=false`);
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
              <Form.Label style={{ color: "#ff9800" }}>
                Create a Room
              </Form.Label>
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
            <Button
              variant="warning"
              onClick={handleCreateRoom}
              className="w-100"
            >
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
          {rooms.length === 0 && (
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
          {rooms.map((room, index) => (
            <ListGroup.Item
              key={index}
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
