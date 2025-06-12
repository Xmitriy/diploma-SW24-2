import { Text } from 'react-native'

interface Props extends React.ComponentProps<typeof Text> {
    className?: string
}

export default function FonttoiText({ className, ...props }: Props) {
    return (
        <Text style={{ fontFamily: "Quicksand" }} className={`font-quicksand ${className}`}>{props.children}</Text>
    )
}