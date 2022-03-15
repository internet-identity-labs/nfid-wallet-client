import React from "react"
import { BiLoaderCircle } from "react-icons/bi"
import { FaKey } from "react-icons/fa"
import { HiMenu, HiSearch } from "react-icons/hi"
import { MdLaptopMac, MdPhoneAndroid } from "react-icons/md"

import Logo from "../assets/dfinity.svg"
import {
  Button,
  H1,
  H2,
  H3,
  H4,
  H5,
  Divider,
  Input,
  Label,
  TextArea,
  P,
  DeleteButton,
  List,
  ListItemHead,
  ListItem,
  CardBody,
  Card,
  CardTitle,
  CardAction,
  Chip,
} from "../index"

export const KitchenSink: React.FC = () => {
  return (
    <div className="flex flex-col w-full min-h-screen mx-auto bg-gray-100">
      <main className="flex flex-1">
        <div className="container p-4 mx-auto xl:max-w-7xl lg:p-8">
          <div className="space-y-5 md:grid lg:grid-cols-2 lg:space-y-0 lg:space-x-5">
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
                    <Input
                      icon={<HiSearch className="w-5 h-5 text-gray-500" />}
                      placeholder={"Search"}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-2">
                    <Label>Example</Label>
                    <TextArea
                      helperText={"Some help information can be put here"}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-2">
                    <Label>Chips</Label>
                    <div className="inline-flex flex-wrap items-center">
                      <Chip solid icon={<HiMenu />}>
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
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Perferendis, quo ullam ad modi impedit quam fuga nesciunt
                  animi placeat quidem?
                </P>
                <P>
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit. In
                  dolor deleniti odio dignissimos voluptatum inventore sequi sed
                  quisquam
                </P>

                <div className="mt-6">
                  <List>
                    <List.Header>
                      <ListItemHead
                        title={"List item head"}
                        description={
                          "This describes or gives context to the list (optional)"
                        }
                      ></ListItemHead>
                    </List.Header>
                    <List.Items>
                      <ListItem
                        title={"Mert Polat"}
                        subtitle={"Front-end Developer"}
                        src={Logo}
                      />
                      <ListItem
                        title={"John Doe"}
                        subtitle={"Second variant without image"}
                      />
                    </List.Items>
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

            <Button secondary className="mx-2">
              Filled button
            </Button>

            <Button text>Text button</Button>
            <DeleteButton />

            <Button secondary block className="my-3">
              Block button
            </Button>
          </div>

          {/* Example Screen 1*/}
          <div className="mb-12 h-100vh">
            <Card className="flex flex-col h-full">
              <CardTitle>Example screen 1</CardTitle>

              <Divider noGutters />

              <CardBody>
                <P>
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                  Officia molestias rerum perferendis aspernatur ad voluptatem
                  molestiae quod, voluptate distinctio fugit reiciendis id eaque
                  necessitatibus eveniet. Eveniet nihil voluptatibus quae
                  corrupti.
                </P>
              </CardBody>

              <CardAction className="md:flex-row-reverse" bottom divider>
                <Button secondary className="w-full md:w-[250px]">
                  Create new Profile
                </Button>
                <Button text className="w-full md:w-[250px]">
                  Close
                </Button>
              </CardAction>
            </Card>
          </div>

          {/* Example Screen 2*/}
          <div className="mb-12 h-100vh">
            <Card className="flex flex-col h-full">
              <CardTitle>Example Screen 2</CardTitle>

              <Divider noGutters />

              <CardBody>
                <P>
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                  Officia molestias rerum perferendis aspernatur ad voluptatem
                  molestiae quod, voluptate distinctio fugit reiciendis id eaque
                  necessitatibus eveniet. Eveniet nihil voluptatibus quae
                  corrupti.
                </P>
              </CardBody>

              <CardAction className="justify-center">
                <Button secondary className="w-full md:w-[250px]">
                  Continue
                </Button>
              </CardAction>
            </Card>
          </div>

          {/* Example Screen 3*/}
          <div className="mb-12 h-100vh">
            <Card className="flex flex-col h-full">
              <CardTitle>Example Screen 3</CardTitle>

              <Divider noGutters />

              <CardBody>
                <P>
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                  Officia
                </P>

                <div className="mt-12">
                  <List>
                    <List.Items>
                      <ListItem
                        title={"iPhone 13"}
                        subtitle={
                          <div className="flex flex-row flex-wrap gap-1">
                            <Chip icon={<FaKey />} dense>
                              Chrome
                            </Chip>
                          </div>
                        }
                        icon={
                          <MdPhoneAndroid className="text-xl text-gray-600" />
                        }
                        action={<DeleteButton disabled />}
                      />
                      <ListItem
                        title={"MacBook Pro"}
                        subtitle={
                          <div className="flex flex-row flex-wrap gap-2">
                            <Chip icon={<FaKey />} dense>
                              Chrome
                            </Chip>
                            <Chip icon={<FaKey />} dense>
                              Edge
                              <BiLoaderCircle className="ml-2 animate-spin" />
                            </Chip>
                          </div>
                        }
                        icon={<MdLaptopMac className="text-xl text-gray-600" />}
                        action={<DeleteButton onClick={() => {}} />}
                      />
                    </List.Items>
                  </List>
                </div>
              </CardBody>

              <CardAction
                className="justify-center my-6 lg:my-12"
                bottom
                divider
              >
                <Button className="w-full md:w-[250px]">Back</Button>
                <Button secondary className="w-full md:w-[250px]">
                  Continue
                </Button>
              </CardAction>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
