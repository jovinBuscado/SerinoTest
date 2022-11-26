# SerinoTest
For serino technical test

## Download and execute [mongoDB](https://www.mongodb.com/try/download/community)

### Or check [MongoDB installation Tutorials](https://www.mongodb.com/docs/manual/installation/#mongodb-installation-tutorials)

### For Windows
1. Download community server database download
    ![Download Image](img/download.JPG)
2. After download completes extract the zip file(mongodb-windows-x86_64-6.0.3) to desired location
    ![Extract Image](img/extract.JPG)
3. Open command prompt and goto extracted file and goto bin folder(`cd C:/location/of/extracted/file/mongodb-win32-x86_64-windows-6.0.3/bin`)
    ![Command Prompt Image](img/cmd.JPG)
4. Create directory "data"
    ![Make Directory Image](img/mkdir.JPG)
5. Execute command `monggod.exe --dbpath ./data` to run the database server
    ![Run Database Image](img/rundb.JPG)
6. To check if the database is working goto to [localhost:27017](http://localhost:27017/), and it will show *It looks like you are trying to access MongoDB over HTTP on the native driver port.*
    ![Check Database Image](img/check.JPG)


Distance calculation taken from http://www.movable-type.co.uk/scripts/latlong.html