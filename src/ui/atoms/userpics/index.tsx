import UserPicture1 from "src/assets/userpics/userpic_1.svg"
import UserPicture2 from "src/assets/userpics/userpic_2.svg"
import UserPicture3 from "src/assets/userpics/userpic_3.svg"
import UserPicture4 from "src/assets/userpics/userpic_4.svg"
import UserPicture5 from "src/assets/userpics/userpic_5.svg"
import UserPicture6 from "src/assets/userpics/userpic_6.svg"
import UserPicture7 from "src/assets/userpics/userpic_7.svg"
import UserPicture8 from "src/assets/userpics/userpic_8.svg"
import UserPicture9 from "src/assets/userpics/userpic_9.svg"
import UserPicture10 from "src/assets/userpics/userpic_10.svg"
import UserPicture11 from "src/assets/userpics/userpic_11.svg"
import UserPicture12 from "src/assets/userpics/userpic_12.svg"
import UserPicture13 from "src/assets/userpics/userpic_13.svg"
import UserPicture14 from "src/assets/userpics/userpic_14.svg"
import UserPicture15 from "src/assets/userpics/userpic_15.svg"
import UserPicture16 from "src/assets/userpics/userpic_16.svg"

export interface UserPictureProps {}

export const UserPicture = (): string => {
  const picturesArray = [
    UserPicture1,
    UserPicture2,
    UserPicture3,
    UserPicture4,
    UserPicture5,
    UserPicture6,
    UserPicture7,
    UserPicture8,
    UserPicture9,
    UserPicture10,
    UserPicture11,
    UserPicture12,
    UserPicture13,
    UserPicture14,
    UserPicture15,
    UserPicture16,
  ]

  return picturesArray[Math.floor(Math.random() * (14 - 0 + 1)) + 0]
}
