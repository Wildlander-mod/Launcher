export class UpdateService {
  private checkedForUpdate = false;

  isUpdated() {
    return this.checkedForUpdate;
  }

  setUpdateStatus(status: boolean) {
    this.checkedForUpdate = status;
  }
}
