# 3D Visualization Template for the Liquid Galaxy Cluster

## DEVS GUIDE


### Warning
You must open the specified port (8120).
You can change the port if needed, remember to modify the port in the open script too.

### FIRST STEPS
- Select use template in the GitHub dashboard
- Clone your template GitHub repo
- Execute: `cd <RepoName>`
- Execute: `npm install`


### With Liquid Galaxy Cluster

- Launch Project: `bash open-project`

### No Liquid Galaxy Cluster
*Note: This have to be done manually.*
- `npm start NUMSCREEN`
  - `NUMSCREEN` is the number of browser windows you want to open. By default is 5.
- Open `NUMSCREEN` browser windows following the name convention
  - Master (1) is `http://localhost:PORT/1`
  - Slave 2 is `http://localhost:PORT/2`
  - Slave 3 is `http://localhost:PORT/2`
  - ...
  - Slave N is `http://localhost:PORT/N`
- The order of the browser windows are the following:
  - ![](./images/screenOrder.png)
  - `(...9, 7, 5, 3, 1, 2, 4, 6, 8...)`
  