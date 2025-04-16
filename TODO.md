# HTTP Interaction

- | method | path              | purpose                                                            | status code | header                    | response body                                                          |
  | ------ | ----------------- | ------------------------------------------------------------------ | ----------- | ------------------------- | ---------------------------------------------------------------------- |
  | GET    | `dev/login`       | `to display login page for player to login`                        | `200`       | `content-type: text/html` | `html content displaying login page`                                   |
  | POST   | `dev/login`       | `to submit login and redirect to home page`                        | `200`       | `content-type: text/html` | `html content displaying home page`                                    |
  | GET    | `dev/room`        | `to display room with option create room and join room`            | `200`       | `content-type: text/html` | `html content displaying the option for create and join room`          |
  | POST   | `dev/room/create` | `to create a room and redirect to lobby by providing room code`    | `200`       | `content-type: text/html` | `html content displaying the lobby with room code and waiting players` |
  | POST   | `dev/room/join`   | `to submit room code of a particular player and redirect to lobby` | `200`       | `content-type: text/html` | `html content displaying the lobby with room code and waiting players` |
  | GET    | `dev/play`        | `to join in a running game`                                        | `200`       | `content-type: text/html` | `html content displaying the lobby with waiting players`               |
