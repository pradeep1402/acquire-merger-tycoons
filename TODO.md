# HTTP Interaction

- | method | path                  | purpose                                                            | status code | header                    | response body                                                          |
  | ------ | --------------------- | ------------------------------------------------------------------ | ----------- | ------------------------- | ---------------------------------------------------------------------- |
  | GET    | `acquire/login`       | `to display login page for player to login`                        | `200`       | `content-type: text/html` | `html content displaying login page`                                   |
  | POST   | `acquire/login`       | `to submit login and redirect to home page`                        | `200`       | `content-type: text/html` | `html content displaying home page`                                    |
  | GET    | `acquire/room`        | `to display room with option create room and join room`            | `200`       | `content-type: text/html` | `html content displaying the option for create and join room`          |
  | POST   | `acquire/room/create` | `to create a room and redirect to lobby by providing room code`    | `200`       | `content-type: text/html` | `html content displaying the lobby with room code and waiting players` |
  | POST   | `acquire/room/join`   | `to submit room code of a particular player and redirect to lobby` | `200`       | `content-type: text/html` | `html content displaying the lobby with room code and waiting players` |
  | GET    | `acquire/play`        | `to join in a public lobby`                                        | `200`       | `content-type: text/html` | `html content displaying the lobby with waiting players`               |
  | GET    | `acquire/game`        | `to join in the game`                                              | `200`       | `content-type: text/html` | `html content displaying the game page`                                |
