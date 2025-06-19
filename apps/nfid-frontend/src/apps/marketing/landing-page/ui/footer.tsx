import { Container } from "./container"
import { Socials } from "./socials"

export function Footer() {
  return (
    <Container>
      <div className="flex justify-center pb-[25px] md:pb-[30px]">
        <Socials className="order-1" />
      </div>
    </Container>
  )
}
