// убираем из модели все ненужные поля и преобразовываем в объект
module.exports = class UserDto {
    email;
    id;
    isActivated;

    constructor(model) {
        this.email = model.email;
        this.username = model.username;
        this.firstName = model.firstName;
        this.lastName = model.lastName;
        this.id = model._id;
        this.isActivated = model.isActivated;
    }
}