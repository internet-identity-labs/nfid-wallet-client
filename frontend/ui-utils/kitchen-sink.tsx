import { Divider } from "frontend/ui-utils/atoms/divider"
import { Input } from "frontend/ui-utils/atoms/input"
import { Label } from "frontend/ui-utils/atoms/input/label"
import { TextArea } from "frontend/ui-utils/atoms/input/text-area"
import { P } from "frontend/ui-utils/atoms/typography/paragraph"
import React, { useState } from "react"
import { Card } from "./molecules/card"
import { H1, H2, H3, H4, H5 } from "frontend/ui-utils/atoms/typography"
import { Button } from "frontend/ui-utils/atoms/button"
import { DropdownMenu } from "./molecules/menu"
import { CardTitle } from "./molecules/card/title"
import { CardBody } from "./molecules/card/body"
import { CardAction } from "./molecules/card/action"
import { Chip } from "./atoms/chip"
import { IFrame } from "./molecules/iframe"
import { List } from "./molecules/list"
import { ListItemHead } from "./molecules/list/list-item-head"
import { ListItem } from "./molecules/list/list-item"
import { HiMenu, HiSearch } from "react-icons/hi"

export const KitchenSink: React.FC = () => {
  const [showFrame, setShowFrame] = useState(false)
  return (
    <>
      <div className="md:grid lg:grid-cols-2  space-y-5 lg:space-y-0 lg:space-x-5">
        <Card>
          <CardBody>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 sm:col-span-2">
                <Label>Input label</Label>
                <Input />
              </div>
              <div className="col-span-2 sm:col-span-2">
                <Label>Input label with prepend and placeholder</Label>
                <Input
                  prependedText={"http://"}
                  placeholder={"www.example.com"}
                />
              </div>
              <div className="col-span-2 sm:col-span-2">
                <Label>Search input</Label>
                <Input icon={<HiSearch />} placeholder={"Search"} />
              </div>
              <div className="col-span-2 sm:col-span-2">
                <Label>Example</Label>
                <TextArea
                  infoMessage={"Some help information can be put here"}
                />
              </div>
              <div className="col-span-2 sm:col-span-2">
                <Label>Chips</Label>
                <div className="inline-flex items-center flex-wrap">
                  <Chip solid icon={<HiMenu className="mr-2"/>}>
                    Hamburger
                  </Chip>
                  <Chip solid className="my-1 mr-1 sm:m-1">
                    Hamburger
                  </Chip>
                  <Chip>Hamburger</Chip>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <P>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. In dolor
              deleniti odio dignissimos voluptatum inventore sequi sed quisquam
            </P>

            <div className="mt-4">
              <Label>Dropdown button</Label>
              <DropdownMenu />
            </div>

            <div className="mt-4">
              <Label>IFrame</Label>
              <Button onClick={() => setShowFrame(!showFrame)}>
                Toggle IFrame
              </Button>
              {showFrame && <IFrame title={"Lorem ipsum dolor sit amet"} />}
            </div>

            <div className="mt-4">
              <List>
                {{
                  head: (
                    <ListItemHead
                      title={"List item head"}
                      description={
                        "This describes or gives context to the list (optional)"
                      }
                    />
                  ),
                  items: [
                    <ListItem
                      title={"Mert Polat"}
                      subtitle={"Front-end Developer"}
                      src="/frontend/assets/dfinity.svg"
                    />,
                    <ListItem
                      title={"John Doe"}
                      subtitle={"Second variant without image"}
                    />,
                  ],
                }}
              </List>
            </div>
          </CardBody>
        </Card>
      </div>

      <Divider />

      <div className="my-4">
        <H1 className="mb-6">Typography</H1>
        <H2 className="mb-6">Typography</H2>
        <H3 className="mb-6">Typography</H3>
        <H4 className="mb-6">Typography</H4>
        <H5 className="mb-6">Typography</H5>

        <P>Lorem ipsum dolor sit amet consectetur.</P>
      </div>

      <Divider />

      <div className="my-4">
        <Button>Default button</Button>

        <Button filled className="mx-2">
          Filled button
        </Button>

        <Button text>Text button</Button>

        <Button filled block className="my-3">
          Block button
        </Button>
      </div>

      {/* Example Screen 1*/}
      <div className="h-[100vh] mb-12">
        <Card className="h-full flex flex-col">
          <CardTitle>Example screen 1</CardTitle>
          <Divider noGutters />
          <CardBody>
            <P>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Officia
              molestias rerum perferendis aspernatur ad voluptatem molestiae
              quod, voluptate distinctio fugit reiciendis id eaque
              necessitatibus eveniet. Eveniet nihil voluptatibus quae corrupti.
            </P>
          </CardBody>
          <CardAction className="md:flex-row-reverse" bottom divider>
            <Button filled className="w-full md:w-[250px]">
              Create new Profile
            </Button>
            <Button text className="w-full md:w-[250px]">
              Close
            </Button>
          </CardAction>
        </Card>
      </div>

      {/* Example Screen 2*/}
      <div className="h-[100vh] mb-12">
        <Card className="h-full flex flex-col">
          <CardTitle>Example Screen 2</CardTitle>
          <Divider noGutters />
          <CardBody>
            <P>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Officia
              molestias rerum perferendis aspernatur ad voluptatem molestiae
              quod, voluptate distinctio fugit reiciendis id eaque
              necessitatibus eveniet. Eveniet nihil voluptatibus quae corrupti.
            </P>
          </CardBody>
          <CardAction className="justify-center">
            <Button filled className="w-full md:w-[250px]">
              Continue
            </Button>
          </CardAction>
        </Card>
      </div>

      {/* Example Screen 3*/}
      <div className="h-[100vh] mb-12">
        <Card className="h-full flex flex-col">
          <CardTitle>Example Screen 3</CardTitle>
          <Divider noGutters />
          <CardBody>
            <P>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Officia
              molestias rerum perferendis aspernatur ad voluptatem molestiae
              quod, voluptate distinctio fugit reiciendis id eaque
              necessitatibus eveniet. Eveniet nihil voluptatibus quae corrupti.
            </P>
          </CardBody>
          <CardAction className="justify-center my-6 lg:my-12" bottom divider>
            <Button className="w-full md:w-[250px]">Back</Button>
            <Button filled className="w-full md:w-[250px]">
              Continue
            </Button>
          </CardAction>
        </Card>
      </div>
    </>
  )
}
