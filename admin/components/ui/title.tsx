type Props = {
  label: string
}

export default function Title(props: Props) {
  return (
    <h1 className="black flex font-nohemi text-2xl font-medium text-[#0B0C0B]">
      {props.label}
    </h1>
  )
}
