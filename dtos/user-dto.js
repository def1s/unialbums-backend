// убираем из модели все ненужные поля и преобразовываем в объект
module.exports = class UserDto {
    email;
    username;
    firstName;
    lastName;
    avatar;
    id;
    isActivated;

    constructor(model) {
        this.email = model.email;
        this.username = model.username;
        this.firstName = model.firstName;
        this.lastName = model.lastName;
        this.avatar = model.avatar;
        this.id = model._id;
        this.isActivated = model.isActivated;
    }
}